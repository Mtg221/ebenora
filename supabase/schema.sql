-- ============================================================
-- EBENORA — Schéma Supabase (Postgres)
-- À exécuter dans le SQL Editor de votre projet Supabase.
-- ============================================================

-- Extension pour uuid
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

create table if not exists public.paintings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text,
  images      text[] not null default '{}',
  -- formats: [{ "label": "A3", "dimensions": "30x40cm", "price": 25000, "stock": 5 }]
  formats     jsonb not null default '[]',
  -- matières proposées (cadre) : sous-ensemble de {'toile','verre'}
  materials   text[] not null default '{}',
  -- autorise les demandes de dimensions sur-mesure (sur devis)
  custom_allowed boolean not null default false,
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Colonnes ajoutées après coup (idempotent si la table existait déjà).
alter table public.paintings add column if not exists materials text[] not null default '{}';
alter table public.paintings add column if not exists custom_allowed boolean not null default false;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text,
  customer_address text,
  total            numeric(12,2) not null default 0,
  status           text not null default 'nouvelle',
  note             text,
  created_at       timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  painting_id uuid references public.paintings(id) on delete set null,
  title       text not null,
  format      text not null,
  material    text,
  -- dimensions demandées pour une commande sur-mesure (sinon null)
  custom_dimensions text,
  qty         integer not null check (qty > 0),
  price       numeric(12,2) not null
);

-- Colonnes ajoutées après coup (idempotent si la table existait déjà).
alter table public.order_items add column if not exists material text;
alter table public.order_items add column if not exists custom_dimensions text;

-- Réglages de contenu du site (images éditoriales : hero, à propos…)
create table if not exists public.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_paintings_active on public.paintings(active);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.paintings   enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.settings    enable row level security;

-- SETTINGS : lecture publique ; écriture réservée aux admins connectés
drop policy if exists settings_select_public on public.settings;
create policy settings_select_public on public.settings
  for select using (true);

drop policy if exists settings_write_admin on public.settings;
create policy settings_write_admin on public.settings
  for all to authenticated using (true) with check (true);

-- PAINTINGS : lecture publique des tableaux actifs ; écriture réservée aux admins connectés
drop policy if exists paintings_select_public on public.paintings;
create policy paintings_select_public on public.paintings
  for select using (active = true);

drop policy if exists paintings_select_admin on public.paintings;
create policy paintings_select_admin on public.paintings
  for select to authenticated using (true);

drop policy if exists paintings_write_admin on public.paintings;
create policy paintings_write_admin on public.paintings
  for all to authenticated using (true) with check (true);

-- ORDERS : création publique (via la fonction place_order) ; lecture/màj réservées aux admins
drop policy if exists orders_select_admin on public.orders;
create policy orders_select_admin on public.orders
  for select to authenticated using (true);

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update to authenticated using (true) with check (true);

drop policy if exists order_items_select_admin on public.order_items;
create policy order_items_select_admin on public.order_items
  for select to authenticated using (true);

-- ------------------------------------------------------------
-- Fonction de commande (transaction : crée la commande, ses lignes,
-- décrémente le stock du format concerné). Exécutée en SECURITY DEFINER
-- pour permettre au public de commander sans exposer les tables en écriture.
-- items = [{ "painting_id": "...", "format": "A3", "material": "toile", "qty": 2 }]
-- Une ligne sur-mesure : { "painting_id": "...", "custom": true,
--   "custom_dimensions": "90 x 60 cm", "material": "verre", "qty": 1 }
-- (sur devis : prix 0, aucun décrément de stock)
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

-- autoriser le public (anon) et les admins à appeler la fonction
grant execute on function public.place_order(text,text,text,text,text,jsonb) to anon, authenticated;

-- ------------------------------------------------------------
-- Storage : bucket public pour les images des tableaux
-- (À créer aussi via l'UI Storage ; ce bloc le crée si besoin.)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', true)
on conflict (id) do nothing;

-- lecture publique des images
drop policy if exists paintings_images_read on storage.objects;
create policy paintings_images_read on storage.objects
  for select using (bucket_id = 'paintings');

-- upload/màj/suppression réservés aux admins connectés
drop policy if exists paintings_images_write on storage.objects;
create policy paintings_images_write on storage.objects
  for all to authenticated using (bucket_id = 'paintings') with check (bucket_id = 'paintings');
