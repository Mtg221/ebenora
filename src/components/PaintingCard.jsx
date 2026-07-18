import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../lib/format'

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="#DCCBB3"/><text x="50%" y="50%" font-family="serif" font-size="20" fill="#7A5233" text-anchor="middle" dominant-baseline="middle">EBENORA</text></svg>`
)

export default function PaintingCard({ painting }) {
  const navigate = useNavigate()
  const cover = painting.images?.[0] || PLACEHOLDER
  const prices = (painting.formats || []).map((f) => Number(f.price)).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : null

  return (
    <article className="card" onClick={() => navigate(`/tableau/${painting.id}`)}>
      <div className="card-media">
        {painting.featured && <span className="card-tag">Sélection</span>}
        <img src={cover} alt={painting.title} loading="lazy" />
      </div>
      <div className="card-body">
        {painting.category && <div className="card-cat">{painting.category}</div>}
        <h3 className="card-title">{painting.title}</h3>
        {minPrice !== null && (
          <div className="card-price">
            <span className="price">{formatPrice(minPrice)}</span>{' '}
            {prices.length > 1 && <small>· à partir de</small>}
          </div>
        )}
      </div>
    </article>
  )
}
