import { useEffect, useState } from 'react'
import { isConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  adminListPaintings, createPainting, updatePainting, deletePainting, uploadImage,
  adminListOrders, updateOrderStatus, getSettings, setSetting, getSiteAnalytics,
} from '../lib/api'
import { formatPrice, formatDate } from '../lib/format'
import { SIZES, MATERIALS, materialLabel } from '../lib/sizes'
import { SITE_IMAGES, IMG_PLACEHOLDER } from '../lib/settings'
import Modal from '../components/Modal'

const STATUSES = ['nouvelle', 'contactée', 'payée', 'expédiée', 'annulée']

export default function AdminPage() {
  const { user, loading, login, logout } = useAuth()

  if (!isConfigured) {
    return (
      <section className="section container">
        <div className="empty">
          <h2>Espace admin</h2>
          <p className="muted">
            Configurez Supabase (fichier <code>.env</code>) puis créez votre compte administrateur
            pour gérer le catalogue et les commandes.
          </p>
        </div>
      </section>
    )
  }

  if (loading) return <div className="spinner" />
  if (!user) return <AdminLogin login={login} />

  return <AdminDashboard user={user} logout={logout} />
}

function AdminLogin({ login }) {
  const { notify } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try { await login(email, password) }
    catch (err) { notify(err.message || 'Connexion refusée', 'error') }
    finally { setBusy(false) }
  }

  return (
    <div className="admin-login">
      <div className="center">
        <span className="eyebrow">EBENORA</span>
        <h2>Administration</h2>
        <hr className="gold-rule" />
      </div>
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

function AdminDashboard({ user, logout }) {
  const [tab, setTab] = useState('paintings')
  return (
    <section className="section container">
      <div className="admin-bar">
        <div>
          <span className="eyebrow">Administration</span>
          <h2 style={{ margin: 0 }}>Tableau de bord</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="muted" style={{ fontSize: '0.85rem' }}>{user.email}</span>
          <button className="btn btn-outline btn-sm" onClick={logout}>Déconnexion</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'paintings' ? 'active' : ''}`} onClick={() => setTab('paintings')}>Tableaux</button>
        <button className={`admin-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Commandes</button>
        <button className={`admin-tab ${tab === 'site' ? 'active' : ''}`} onClick={() => setTab('site')}>Site</button>
        <button className={`admin-tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>Statistiques</button>
      </div>

      {tab === 'paintings' && <PaintingsAdmin />}
      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'site' && <SiteAdmin />}
      {tab === 'stats' && <StatsAdmin />}
    </section>
  )
}

// ─── Statistiques de trafic (Vercel Web Analytics) ──────

function StatsAdmin() {
  const { notify } = useToast()
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    getSiteAnalytics(days)
      .then((d) => { if (alive) setData(d) })
      .catch((err) => { if (alive) { setError(err.message); notify(err.message, 'error') } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [days])

  if (loading) return <div className="spinner" />
  if (error) {
    return (
      <div className="empty">
        <p className="muted">Impossible de charger les statistiques&nbsp;: {error}</p>
        <p className="muted" style={{ fontSize: '0.82rem' }}>
          Vérifiez que Web Analytics est activé sur Vercel et que les variables
          <code> VERCEL_TOKEN</code>, <code>VERCEL_PROJECT_ID</code> sont renseignées.
        </p>
      </div>
    )
  }
  if (!data) return null

  const maxDaily = Math.max(1, ...data.daily.map((d) => d.pageviews || 0))

  return (
    <>
      <div className="stats-head">
        <p className="muted" style={{ margin: 0, maxWidth: 520 }}>
          Trafic du site sur les {days} derniers jours (source&nbsp;: Vercel Web Analytics).
        </p>
        <div className="stats-range">
          <button className={`admin-tab ${days === 7 ? 'active' : ''}`} onClick={() => setDays(7)}>7 jours</button>
          <button className={`admin-tab ${days === 30 ? 'active' : ''}`} onClick={() => setDays(30)}>30 jours</button>
        </div>
      </div>

      <div className="stat-kpis">
        <div className="stat-kpi">
          <span className="stat-kpi-label">Visiteurs</span>
          <span className="stat-kpi-value">{(data.totals.visitors || 0).toLocaleString('fr-FR')}</span>
        </div>
        <div className="stat-kpi">
          <span className="stat-kpi-label">Pages vues</span>
          <span className="stat-kpi-value">{(data.totals.pageviews || 0).toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {data.daily.length > 0 && (
        <div className="stat-block">
          <h4>Pages vues par jour</h4>
          <div className="stat-chart">
            {data.daily.map((d) => (
              <div className="stat-bar-col" key={d.timestamp} title={`${new Date(d.timestamp).toLocaleDateString('fr-FR')} — ${d.pageviews} vues`}>
                <div className="stat-bar" style={{ height: `${((d.pageviews || 0) / maxDaily) * 100}%` }} />
                <span className="stat-bar-x">{new Date(d.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stat-lists">
        <StatList title="Pages les plus vues" rows={data.routes} label={(r) => r.route || '—'} />
        <StatList title="Sources de trafic" rows={data.referrers} label={(r) => r.referrerHostname || 'Direct'} />
        <StatList title="Pays" rows={data.countries} label={(r) => r.country || '—'} />
        <StatList title="Appareils" rows={data.devices} label={(r) => r.deviceType || '—'} />
      </div>
    </>
  )
}

function StatList({ title, rows, label }) {
  if (!rows?.length) return null
  const max = Math.max(1, ...rows.map((r) => r.pageviews || 0))
  return (
    <div className="stat-block">
      <h4>{title}</h4>
      <ul className="stat-list">
        {rows.map((r, i) => (
          <li key={i}>
            <span className="stat-list-bar" style={{ width: `${((r.pageviews || 0) / max) * 100}%` }} />
            <span className="stat-list-label">{label(r)}</span>
            <span className="stat-list-value">{(r.pageviews || 0).toLocaleString('fr-FR')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Contenu du site (images éditoriales) ───────────────

function SiteAdmin() {
  const { notify } = useToast()
  const [images, setImages] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)

  useEffect(() => {
    getSettings()
      .then(setImages)
      .catch((err) => notify(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleUpload(key, file) {
    if (!file) return
    setBusyKey(key)
    try {
      const url = await uploadImage(file)
      await setSetting(key, url)
      setImages((s) => ({ ...s, [key]: url }))
      notify('Image mise à jour')
    } catch (err) { notify(err.message, 'error') }
    finally { setBusyKey(null) }
  }

  async function handleRemove(key) {
    setBusyKey(key)
    try {
      await setSetting(key, '')
      setImages((s) => ({ ...s, [key]: '' }))
      notify('Image retirée')
    } catch (err) { notify(err.message, 'error') }
    finally { setBusyKey(null) }
  }

  if (loading) return <div className="spinner" />

  return (
    <>
      <p className="muted" style={{ marginTop: -8, marginBottom: 24, maxWidth: 560 }}>
        Ces images illustrent la page d'accueil et la page À propos. Sans image, un visuel sobre aux
        couleurs de la marque est affiché.
      </p>
      <div className="site-img-grid">
        {SITE_IMAGES.map(({ key, label, hint }) => {
          const url = images[key]
          const busy = busyKey === key
          return (
            <div className="site-img-card" key={key}>
              <div className="site-img-preview">
                <img src={url || IMG_PLACEHOLDER} alt="" />
              </div>
              <div className="site-img-body">
                <h4>{label}</h4>
                <p className="muted">{hint}</p>
                <div className="site-img-actions">
                  <label className={`btn btn-sm ${busy ? '' : ''}`} style={{ cursor: 'pointer' }}>
                    {busy ? 'Envoi…' : (url ? 'Remplacer' : 'Ajouter une image')}
                    <input
                      type="file" accept="image/*" hidden disabled={busy}
                      onChange={(e) => handleUpload(key, e.target.files?.[0])}
                    />
                  </label>
                  {url && (
                    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => handleRemove(key)}>
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ─── Gestion des tableaux ───────────────────────────────

function PaintingsAdmin() {
  const { notify } = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // painting object or {} for new

  async function refresh() {
    setLoading(true)
    try { setList(await adminListPaintings()) }
    catch (err) { notify(err.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  async function handleDelete(p) {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return
    try { await deletePainting(p.id); notify('Tableau supprimé'); refresh() }
    catch (err) { notify(err.message, 'error') }
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <button className="btn" onClick={() => setEditing({})}>+ Nouveau tableau</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th></th><th>Titre</th><th>Catégorie</th><th>Formats</th><th>Vedette</th><th>Actif</th><th></th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td><img className="thumb-xs" src={p.images?.[0] || IMG_PLACEHOLDER} alt="" /></td>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td>{(p.formats || []).length}</td>
                  <td>{p.featured ? '★' : '—'}</td>
                  <td>{p.active ? 'Oui' : 'Non'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Éditer</button>
                    <button className="link-btn" onClick={() => handleDelete(p)}>Suppr.</button>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan="7" className="muted" style={{ textAlign: 'center', padding: 30 }}>Aucun tableau. Créez-en un.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PaintingEditor
          painting={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh() }}
        />
      )}
    </>
  )
}

function PaintingEditor({ painting, onClose, onSaved }) {
  const { notify } = useToast()
  const isNew = !painting.id
  const [form, setForm] = useState({
    title: painting.title || '',
    description: painting.description || '',
    category: painting.category || '',
    images: painting.images || [],
    formats: painting.formats?.length ? painting.formats : [{ label: '', dimensions: '', price: '', stock: '' }],
    materials: painting.materials || [],
    custom_allowed: painting.custom_allowed || false,
    featured: painting.featured || false,
    active: painting.active ?? true,
  })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const toggleMaterial = (value) => setForm((f) => ({
    ...f,
    materials: f.materials.includes(value)
      ? f.materials.filter((m) => m !== value)
      : [...f.materials, value],
  }))
  const setFormat = (i, k, v) => setForm((f) => {
    const formats = [...f.formats]; formats[i] = { ...formats[i], [k]: v }
    // Choisir une taille remplit automatiquement les dimensions.
    if (k === 'label') {
      const s = SIZES.find((s) => s.label === v)
      if (s) {
        formats[i].dimensions = s.dimensions
        if (formats[i].price === '' || formats[i].price == null) formats[i].price = s.price
      }
    }
    return { ...f, formats }
  })

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set('images', [...form.images, url])
      notify('Image ajoutée')
    } catch (err) { notify(err.message, 'error') }
    finally { setUploading(false) }
  }

  async function save() {
    if (!form.title.trim()) { notify('Le titre est requis', 'error'); return }
    const payload = {
      ...form,
      formats: form.formats
        .filter((f) => f.label && f.price)
        .map((f) => ({ label: f.label, dimensions: f.dimensions, price: Number(f.price), stock: Number(f.stock) || 0 })),
    }
    setBusy(true)
    try {
      if (isNew) await createPainting(payload)
      else await updatePainting(painting.id, payload)
      notify('Tableau enregistré')
      onSaved()
    } catch (err) { notify(err.message, 'error') }
    finally { setBusy(false) }
  }

  return (
    <Modal title={isNew ? 'Nouveau tableau' : 'Modifier le tableau'} onClose={onClose}>
      <div className="field">
        <label>Titre *</label>
        <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
      </div>
      <div className="field">
        <label>Catégorie</label>
        <input className="input" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Abstrait, Paysage…" />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="field">
        <label>Images</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {form.images.map((src, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img className="thumb-xs" src={src} alt="" />
              <button className="link-btn" onClick={() => set('images', form.images.filter((_, j) => j !== i))} style={{ display: 'block' }}>retirer</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <span className="muted"> Envoi…</span>}
      </div>

      <div className="field">
        <label>Formats (label · dimensions · prix · stock)</label>
        {form.formats.map((f, i) => (
          <div className="fmt-editor" key={i}>
            <select className="input" value={f.label} onChange={(e) => setFormat(i, 'label', e.target.value)}>
              <option value="">Taille…</option>
              {SIZES.map((s) => <option key={s.label} value={s.label}>{s.label} · {s.dimensions}</option>)}
            </select>
            <input className="input" placeholder="Dimensions" value={f.dimensions} onChange={(e) => setFormat(i, 'dimensions', e.target.value)} />
            <input className="input" placeholder="Prix" type="number" value={f.price} onChange={(e) => setFormat(i, 'price', e.target.value)} />
            <input className="input" placeholder="Stock" type="number" value={f.stock} onChange={(e) => setFormat(i, 'stock', e.target.value)} />
            <button className="link-btn" onClick={() => set('formats', form.formats.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => set('formats', [...form.formats, { label: '', dimensions: '', price: '', stock: '' }])}>+ Ajouter un format</button>
      </div>

      <div className="field">
        <label>Matières proposées</label>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {MATERIALS.map((m) => (
            <label key={m.value} style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={form.materials.includes(m.value)} onChange={() => toggleMaterial(m.value)} /> {m.label}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0 }}>
          <input type="checkbox" checked={form.custom_allowed} onChange={(e) => set('custom_allowed', e.target.checked)} />
          Autoriser les demandes de dimensions sur-mesure (sur devis)
        </label>
      </div>

      <div style={{ display: 'flex', gap: 24, margin: '10px 0 20px' }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0 }}>
          <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Mise en avant
        </label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0 }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} /> Visible sur le site
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onClose}>Annuler</button>
        <button className="btn" onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
      </div>
    </Modal>
  )
}

// ─── Gestion des commandes ──────────────────────────────

function OrdersAdmin() {
  const { notify } = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try { setList(await adminListOrders()) }
    catch (err) { notify(err.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  async function changeStatus(order, status) {
    try {
      await updateOrderStatus(order.id, status)
      setList((l) => l.map((o) => (o.id === order.id ? { ...o, status } : o)))
      notify('Statut mis à jour')
    } catch (err) { notify(err.message, 'error') }
  }

  if (loading) return <div className="spinner" />
  if (!list.length) return <p className="empty">Aucune commande pour le moment.</p>

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Date</th><th>Client</th><th>Contact</th><th>Articles</th><th>Total</th><th>Statut</th></tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(o.created_at)}</td>
              <td>{o.customer_name}</td>
              <td style={{ fontSize: '0.82rem' }}>
                {o.customer_email}<br />{o.customer_phone}
              </td>
              <td style={{ fontSize: '0.82rem' }}>
                {(o.order_items || []).map((it) => (
                  <div key={it.id}>
                    {it.title} · {it.custom_dimensions || it.format}
                    {it.material ? ` · ${materialLabel(it.material)}` : ''} × {it.qty}
                    {it.custom_dimensions ? ' (sur devis)' : ''}
                  </div>
                ))}
              </td>
              <td>{formatPrice(o.total)}</td>
              <td>
                <select className="select" value={o.status} onChange={(e) => changeStatus(o, e.target.value)} style={{ padding: '7px 10px' }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
