import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="section container">
      <div className="empty">
        <h1 style={{ fontSize: '4rem', marginBottom: 0 }}>404</h1>
        <p className="muted">Cette page n'existe pas.</p>
        <Link to="/" className="btn" style={{ marginTop: 16 }}>Retour à l'accueil</Link>
      </div>
    </section>
  )
}
