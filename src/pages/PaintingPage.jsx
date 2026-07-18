import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPainting } from '../lib/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../lib/format'
import { IMG_PLACEHOLDER } from '../lib/settings'

export default function PaintingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add } = useCart()
  const { notify } = useToast()

  const [painting, setPainting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [selected, setSelected] = useState(null) // format label
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPainting(id)
      .then((p) => {
        setPainting(p)
        const firstAvailable = (p.formats || []).find((f) => Number(f.stock) > 0)
        setSelected(firstAvailable?.label ?? null)
      })
      .catch(() => setPainting(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="spinner" />
  if (!painting) return <div className="empty container">Tableau introuvable. <Link to="/galerie">Retour à la galerie</Link></div>

  const images = painting.images?.length ? painting.images : [IMG_PLACEHOLDER]
  const format = (painting.formats || []).find((f) => f.label === selected)
  const maxStock = Number(format?.stock) || 0

  function handleAdd() {
    if (!format) return
    add({
      paintingId: painting.id,
      title: painting.title,
      image: images[0],
      format: format.label,
      dimensions: format.dimensions,
      price: Number(format.price),
      qty,
    })
    notify(`« ${painting.title} » ajouté au panier`)
  }

  return (
    <section className="section container">
      <div className="painting">
        <div className="painting-gallery">
          <img
            className="main-img"
            src={images[imgIndex]}
            alt={painting.title}
            onClick={() => setZoom(true)}
          />
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={i === imgIndex ? 'active' : ''}
                  onClick={() => setImgIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="painting-info">
          {painting.category && <span className="eyebrow">{painting.category}</span>}
          <h1>{painting.title}</h1>
          {format && <div className="price" style={{ fontSize: '1.6rem' }}>{formatPrice(format.price)}</div>}
          <p className="muted" style={{ marginTop: 16 }}>{painting.description}</p>

          <div style={{ marginTop: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Format</div>
            <div className="format-list">
              {(painting.formats || []).map((f) => {
                const out = Number(f.stock) <= 0
                return (
                  <div
                    key={f.label}
                    className={`format-row ${selected === f.label ? 'active' : ''} ${out ? 'out' : ''}`}
                    onClick={() => { if (!out) { setSelected(f.label); setQty(1) } }}
                  >
                    <div>
                      <div className="fmt-label">{f.label}</div>
                      <div className="fmt-dim">{f.dimensions}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price" style={{ fontSize: '1.05rem' }}>{formatPrice(f.price)}</div>
                      {out
                        ? <div className="stock-note">Épuisé</div>
                        : Number(f.stock) <= 3 && <div className="stock-note">Plus que {f.stock}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {maxStock > 0 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '10px 0 24px' }}>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxStock, q + 1))}>+</button>
              </div>
              <span className="stock-note">{maxStock} disponible{maxStock > 1 ? 's' : ''}</span>
            </div>
          )}

          <button className="btn" onClick={handleAdd} disabled={!format || maxStock <= 0} style={{ width: '100%' }}>
            {maxStock <= 0 ? 'Indisponible' : 'Ajouter au panier'}
          </button>
          <p className="info-note">
            Le paiement se fait en direct : après votre commande, nous vous recontactons pour le règlement et la livraison.
          </p>
        </div>
      </div>

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <img src={images[imgIndex]} alt={painting.title} />
        </div>
      )}
    </section>
  )
}
