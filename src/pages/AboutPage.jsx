import { Link } from 'react-router-dom'
import { useSiteImages, IMG_PLACEHOLDER } from '../lib/settings'

export default function AboutPage() {
  const siteImages = useSiteImages()
  return (
    <section className="section container">
      <div className="split">
        <img src={siteImages.about_image || IMG_PLACEHOLDER} alt="L'artiste EBENORA" />
        <div>
          <span className="eyebrow">La Maison</span>
          <h2>EBENORA</h2>
          <hr className="gold-rule" />
          <p className="muted">
            L'art ne se contente pas d'habiller un espace. Il lui donne une âme.
          </p>
          <p className="muted">
            Chez EBENORA, nous imaginons une collection d'œuvres contemporaines où les matières,
            les couleurs et les émotions dialoguent avec l'architecture intérieure.
          </p>
          <p className="muted">
            Chaque tableau est sélectionné pour sa capacité à créer une présence, à susciter une
            émotion et à traverser le temps sans perdre de sa force.
          </p>
          <p className="muted">
            Imprimées avec le plus grand soin sur des supports de qualité, nos œuvres sont pensées
            pour s'intégrer naturellement dans des espaces élégants, chaleureux et intemporels.
          </p>
          <p className="muted">
            Plus qu'un tableau, une signature pour votre intérieur.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <a href="mailto:ebenorart.221@gmail.com" className="btn">Nous écrire</a>
            <Link to="/galerie" className="btn btn-outline">Voir les œuvres</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
