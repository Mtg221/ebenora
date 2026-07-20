import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getPainting } from '../lib/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../lib/format'
import { materialLabel } from '../lib/sizes'
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
  const [material, setMaterial] = useState(null)  // matière choisie
  const [customMode, setCustomMode] = useState(false) // sur-mesure
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)

  useEffect(() => {
    setLoading(true)
    getPainting(id)
      .then((p) => {
        setPainting(p)
        const firstAvailable = (p.formats || []).find((f) => Number(f.stock) > 0)
        setSelected(firstAvailable?.label ?? null)
        setMaterial((p.materials || [])[0] ?? null)
      })
      .catch(() => setPainting(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="spinner" />
  if (!painting) return <div className="empty container">Tableau introuvable. <Link to="/galerie">Retour à la galerie</Link></div>

  const images = painting.images?.length ? painting.images : [IMG_PLACEHOLDER]
  const format = (painting.formats || []).find((f) => f.label === selected)
  const maxStock = Number(format?.stock) || 0
  const materials = painting.materials || []
  const canAdd = customMode ? (customW && customH) : (format && maxStock > 0)

  function handleAdd() {
    if (materials.length && !material) { notify('Veuillez choisir une matière', 'error'); return }
    if (customMode) {
      const w = String(customW).trim(), h = String(customH).trim()
      if (!w || !h) { notify('Indiquez la largeur et la hauteur souhaitées', 'error'); return }
      const dims = `${w} × ${h} cm`
      add({
        paintingId: painting.id,
        title: painting.title,
        image: images[0],
        format: 'Sur-mesure',
        dimensions: dims,
        material,
        price: 0,
        qty,
        custom: true,
        customDimensions: dims,
      })
      notify(`Demande sur-mesure pour « ${painting.title} » ajoutée`)
      return
    }
    if (!format) return
    add({
      paintingId: painting.id,
      title: painting.title,
      image: images[0],
      format: format.label,
      dimensions: format.dimensions,
      material,
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
          {!customMode && format && <div className="price" style={{ fontSize: '1.6rem' }}>{formatPrice(format.price)}</div>}
          {customMode && <div className="price" style={{ fontSize: '1.6rem' }}>Sur devis</div>}
          <p className="muted" style={{ marginTop: 16 }}>{painting.description}</p>

          {materials.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Matière</div>
              <div className="format-list">
                {materials.map((m) => (
                  <div
                    key={m}
                    className={`format-row ${material === m ? 'active' : ''}`}
                    onClick={() => setMaterial(m)}
                  >
                    <div className="fmt-label">{materialLabel(m)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!customMode && (
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
          )}

          {painting.custom_allowed && (
            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', textTransform: 'none', letterSpacing: 0, cursor: 'pointer' }}>
                <input type="checkbox" checked={customMode} onChange={(e) => { setCustomMode(e.target.checked); setQty(1) }} />
                Je souhaite des dimensions sur-mesure
              </label>
              {customMode && (
                <>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Largeur (cm)</label>
                      <input className="input" type="number" min="1" value={customW} onChange={(e) => setCustomW(e.target.value)} />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                      <label>Hauteur (cm)</label>
                      <input className="input" type="number" min="1" value={customH} onChange={(e) => setCustomH(e.target.value)} />
                    </div>
                  </div>
                  <p className="info-note" style={{ marginTop: 8 }}>
                    Le prix du sur-mesure vous est communiqué sur devis après réception de votre demande.
                  </p>
                </>
              )}
            </div>
          )}

          {!customMode && maxStock > 0 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '10px 0 24px' }}>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxStock, q + 1))}>+</button>
              </div>
              <span className="stock-note">{maxStock} disponible{maxStock > 1 ? 's' : ''}</span>
            </div>
          )}

          <button className="btn" onClick={handleAdd} disabled={!canAdd} style={{ width: '100%', marginTop: 20 }}>
            {customMode ? 'Demander un devis' : (maxStock <= 0 ? 'Indisponible' : 'Ajouter au panier')}
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
