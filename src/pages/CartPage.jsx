import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import { IMG_PLACEHOLDER } from '../lib/settings'

export default function CartPage() {
  const { items, setQty, remove, clear, total } = useCart()
  const navigate = useNavigate()

  if (!items.length) {
    return (
      <section className="section container">
        <div className="empty">
          <h2>Votre panier est vide</h2>
          <p className="muted">Parcourez la galerie pour trouver l'œuvre qui vous ressemble.</p>
          <Link to="/galerie" className="btn" style={{ marginTop: 16 }}>Voir la galerie</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section container">
      <div className="section-head">
        <span className="eyebrow">Votre sélection</span>
        <h2>Panier</h2>
        <hr className="gold-rule" />
      </div>

      {items.map((it) => (
        <div className="cart-row" key={it.paintingId + it.format}>
          <img src={it.image || IMG_PLACEHOLDER} alt={it.title} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{it.title}</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>{it.format} · {it.dimensions}</div>
            <div className="price" style={{ fontSize: '1rem', marginTop: 4 }}>{formatPrice(it.price)}</div>
          </div>
          <div className="qty">
            <button onClick={() => setQty(it.paintingId, it.format, it.qty - 1)}>−</button>
            <span>{it.qty}</span>
            <button onClick={() => setQty(it.paintingId, it.format, it.qty + 1)}>+</button>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="price">{formatPrice(it.price * it.qty)}</div>
            <button className="link-btn" onClick={() => remove(it.paintingId, it.format)}>Retirer</button>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <button className="link-btn" onClick={clear}>Vider le panier</button>
        <div className="cart-total">Total : {formatPrice(total)}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/galerie" className="btn btn-outline">Continuer</Link>
          <button className="btn" onClick={() => navigate('/commande')}>Passer commande</button>
        </div>
      </div>
    </section>
  )
}
