import { Link, useLocation } from 'react-router-dom'

export default function ConfirmationPage() {
  const { state } = useLocation()
  const name = state?.name

  return (
    <section className="section container">
      <div className="confirm">
        <div className="check">✓</div>
        <span className="eyebrow">Commande reçue</span>
        <h2>Merci{name ? `, ${name}` : ''} !</h2>
        <hr className="gold-rule" style={{ margin: '18px auto' }} />
        <p className="muted">
          Votre commande a bien été enregistrée. Nous vous recontactons très vite par email ou téléphone
          pour finaliser le règlement et organiser la livraison de votre œuvre.
        </p>
        <Link to="/galerie" className="btn" style={{ marginTop: 24 }}>Continuer à explorer</Link>
      </div>
    </section>
  )
}
