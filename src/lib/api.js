import { supabase, isConfigured } from './supabase'
import { DEMO_PAINTINGS } from './demo'

// ─── Tableaux (public) ──────────────────────────────────────

export async function getPaintings({ category = null, featured = null } = {}) {
  if (!isConfigured) {
    return DEMO_PAINTINGS.filter(
      (p) => (category ? p.category === category : true) && (featured !== null ? p.featured === featured : true)
    )
  }
  let query = supabase.from('paintings').select('*').eq('active', true).order('created_at', { ascending: false })
  if (category) query = query.eq('category', category)
  if (featured !== null) query = query.eq('featured', featured)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPainting(id) {
  if (!isConfigured) {
    const p = DEMO_PAINTINGS.find((x) => x.id === id)
    if (!p) throw new Error('Tableau introuvable')
    return p
  }
  const { data, error } = await supabase.from('paintings').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// ─── Commande (public) via la fonction Postgres place_order ──

export async function placeOrder({ name, email, phone, address, note, items }) {
  if (!isConfigured) {
    // Mode démo : simule une commande réussie
    await new Promise((r) => setTimeout(r, 500))
    return 'demo-' + Date.now()
  }
  const { data, error } = await supabase.rpc('place_order', {
    p_name: name,
    p_email: email,
    p_phone: phone || null,
    p_address: address || null,
    p_note: note || null,
    p_items: items.map((i) => ({ painting_id: i.paintingId, format: i.format, qty: i.qty })),
  })
  if (error) throw error
  return data // uuid de la commande
}

// ─── Admin : tableaux (nécessite d'être connecté) ───────────

export async function adminListPaintings() {
  const { data, error } = await supabase.from('paintings').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPainting(payload) {
  const { data, error } = await supabase.from('paintings').insert(clean(payload)).select().single()
  if (error) throw error
  return data
}

export async function updatePainting(id, payload) {
  const { data, error } = await supabase.from('paintings').update(clean(payload)).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePainting(id) {
  const { error } = await supabase.from('paintings').delete().eq('id', id)
  if (error) throw error
}

// whitelist des champs modifiables (évite le mass-assignment)
function clean(p) {
  const { title, description, category, images, formats, featured, active } = p
  return { title, description, category, images, formats, featured, active }
}

// ─── Admin : upload d'image dans le bucket `paintings` ──────

export async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('paintings').upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('paintings').getPublicUrl(path)
  return data.publicUrl
}

// ─── Réglages du site (images de contenu) ───────────────────

// Lecture publique. Renvoie un objet { key: value }. Vide si Supabase non configuré.
export async function getSettings() {
  if (!isConfigured) return {}
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw error
  return Object.fromEntries((data || []).map((r) => [r.key, r.value]))
}

// Écriture réservée aux admins connectés (upsert par clé).
export async function setSetting(key, value) {
  const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

// ─── Admin : commandes ──────────────────────────────────────

export async function adminListOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}
