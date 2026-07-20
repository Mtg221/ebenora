import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart, lineKey } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { placeOrder } from '../lib/api'
import { formatPrice } from '../lib/format'
import { materialLabel } from '../lib/sizes'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', note: '' })
  const [submitting, setSubmitting] = useState(false)

  if (!items.length) {
    return (
      <section className="section container">
        <div className="empty">
          <h2>Aucune commande en cours</h2>
          <Link to="/galerie" className="btn" style={{ marginTop: 16 }}>Voir la galerie</Link>
        </div>
      </section>
    )
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      notify('Nom et email sont requis', 'error')
      return
    }
    setSubmitting(true)
    try {
      await placeOrder({
        ...form,
        items: items.map((i) => ({
          paintingId: i.paintingId,
          format: i.format,
          material: i.material,
          custom: i.custom,
          customDimensions: i.customDimensions,
          qty: i.qty,
        })),
      })
      clear()
      navigate('/confirmation', { state: { name: form.name } })
    } catch (err) {
      notify(err.message || 'Erreur lors de la commande', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section container">
      <div className="section-head">
        <span className="eyebrow">Finaliser</span>
        <h2>Vos coordonnées</h2>
        <hr className="gold-rule" />
      </div>

      <div className="checkout">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nom complet *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="field">
            <label>Email *</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input className="input" value={form.phone} onChange={set('phone')} placeholder="+221 ..." />
          </div>
          <div className="field">
            <label>Adresse de livraison</label>
            <textarea className="textarea" value={form.address} onChange={set('address')} />
          </div>
          <div className="field">
            <label>Message (optionnel)</label>
            <textarea className="textarea" value={form.note} onChange={set('note')} placeholder="Une précision sur votre commande ?" />
          </div>
          <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Envoi…' : 'Confirmer la commande'}
          </button>
          <div className="info-note">
            Aucun paiement en ligne. Nous vous recontactons rapidement pour convenir du règlement et de la livraison.
          </div>
        </form>

        <div className="order-box">
          <h3 style={{ marginTop: 0 }}>Récapitulatif</h3>
          {items.map((it) => (
            <div className="line" key={lineKey(it)}>
              <span>
                {it.title}{' '}
                <span className="muted">
                  · {it.custom ? it.customDimensions : it.format}
                  {it.material ? ` · ${materialLabel(it.material)}` : ''} × {it.qty}
                </span>
              </span>
              <span>{it.custom ? 'Sur devis' : formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="line total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
