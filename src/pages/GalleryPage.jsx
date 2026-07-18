import { useEffect, useState } from 'react'
import { getPaintings } from '../lib/api'
import { SIZES, hasSize } from '../lib/sizes'
import PaintingCard from '../components/PaintingCard'

export default function GalleryPage() {
  const [paintings, setPaintings] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(null)
  const [size, setSize] = useState(null)

  useEffect(() => {
    setLoading(true)
    getPaintings()
      .then(setPaintings)
      .catch(() => setPaintings([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(paintings.map((p) => p.category).filter(Boolean))]
  const shown = paintings
    .filter((p) => (category ? p.category === category : true))
    .filter((p) => (size ? hasSize(p, size) : true))

  return (
    <section className="section container">
      <div className="section-head">
        <span className="eyebrow">Collection</span>
        <h2>La galerie</h2>
        <hr className="gold-rule" />
        <p className="muted">Parcourez l'ensemble des œuvres disponibles en reproduction.</p>
      </div>

      {categories.length > 0 && (
        <div className="filters">
          <button className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory(null)}>Tout</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      )}

      <div className="filters">
        <button className={`chip ${!size ? 'active' : ''}`} onClick={() => setSize(null)}>Toutes tailles</button>
        {SIZES.map((s) => (
          <button key={s.label} className={`chip ${size === s.label ? 'active' : ''}`} onClick={() => setSize(s.label)}>
            {s.label} <small>· {s.dimensions}</small>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : shown.length ? (
        <div className="grid">
          {shown.map((p) => <PaintingCard key={p.id} painting={p} />)}
        </div>
      ) : (
        <p className="empty">Aucune œuvre pour le moment.</p>
      )}
    </section>
  )
}
