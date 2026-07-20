-- ============================================================
-- EBENORA — Migration : matières de cadre + commandes sur-mesure
-- À exécuter UNE FOIS dans le SQL Editor de Supabase.
-- Idempotent et sans danger : ne détruit aucune donnée existante.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Nouvelles colonnes sur les tableaux
--    - materials      : matières proposées, sous-ensemble de {'toile','verre'}
--    - custom_allowed : autorise les demandes de dimensions sur-mesure (sur devis)
-- ------------------------------------------------------------
alter table public.paintings add column if not exists materials text[] not null default '{}';
alter table public.paintings add column if not exists custom_allowed boolean not null default false;

-- ------------------------------------------------------------
-- 2) Nouvelles colonnes sur les lignes de commande
--    - material          : matière choisie par le client
--    - custom_dimensions : dimensions demandées pour une commande sur-mesure (sinon null)
-- ------------------------------------------------------------
alter table public.order_items add column if not exists material text;
alter table public.order_items add column if not exists custom_dimensions text;

-- ------------------------------------------------------------
-- 3) Fonction de commande mise à jour : enregistre la matière et
--    gère les lignes sur-mesure (sur devis, prix 0, sans décrément de stock).
--    items = [{ "painting_id": "...", "format": "A3", "material": "toile", "qty": 2 }]
--    Ligne sur-mesure : { "painting_id": "...", "custom": true,
--      "custom_dimensions": "90 x 60 cm", "material": "verre", "qty": 1 }
-- ------------------------------------------------------------
create or replace function public.place_order(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_address text,
  p_note    text,
  p_items   jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item     jsonb;
  v_painting public.paintings%rowtype;
  v_format   jsonb;
  v_price    numeric;
  v_stock    integer;
  v_qty      integer;
  v_total    numeric := 0;
  v_new_formats jsonb;
  v_idx      integer;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Nom requis';
  end if;
  if p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Email requis';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;

  insert into public.orders (customer_name, customer_email, customer_phone, customer_address, note)
  values (p_name, p_email, p_phone, p_address, p_note)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Quantité invalide';
    end if;

    select * into v_painting from public.paintings
      where id = (v_item->>'painting_id')::uuid and active = true;
    if not found then
      raise exception 'Tableau introuvable';
    end if;

    -- Ligne sur-mesure : sur devis, sans stock ni prix. On l'enregistre telle quelle.
    if coalesce((v_item->>'custom')::boolean, false) then
      if not v_painting.custom_allowed then
        raise exception 'Le sur-mesure n''est pas proposé pour %', v_painting.title;
      end if;
      insert into public.order_items
        (order_id, painting_id, title, format, material, custom_dimensions, qty, price)
      values
        (v_order_id, v_painting.id, v_painting.title, 'Sur-mesure',
         v_item->>'material', v_item->>'custom_dimensions', v_qty, 0);
      continue;
    end if;

    -- retrouver le format demandé dans le jsonb formats
    v_format := null;
    v_idx := 0;
    for v_format in select * from jsonb_array_elements(v_painting.formats)
    loop
      exit when v_format->>'label' = (v_item->>'format');
      v_idx := v_idx + 1;
    end loop;

    if v_format is null or v_format->>'label' <> (v_item->>'format') then
      raise exception 'Format % introuvable pour %', v_item->>'format', v_painting.title;
    end if;

    v_price := (v_format->>'price')::numeric;
    v_stock := coalesce((v_format->>'stock')::int, 0);
    if v_stock < v_qty then
      raise exception 'Stock insuffisant pour % (%).', v_painting.title, v_format->>'label';
    end if;

    -- décrémenter le stock du bon format
    v_new_formats := jsonb_set(
      v_painting.formats,
      array[v_idx::text, 'stock'],
      to_jsonb(v_stock - v_qty)
    );
    update public.paintings set formats = v_new_formats where id = v_painting.id;

    insert into public.order_items (order_id, painting_id, title, format, material, qty, price)
    values (v_order_id, v_painting.id, v_painting.title, v_format->>'label', v_item->>'material', v_qty, v_price);

    v_total := v_total + v_price * v_qty;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- ré-autoriser l'exécution (par sécurité si la fonction a été recréée)
grant execute on function public.place_order(text,text,text,text,text,jsonb) to anon, authenticated;
