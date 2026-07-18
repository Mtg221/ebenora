import { Link } from 'react-router-dom'
import { useSiteImages, IMG_PLACEHOLDER } from '../lib/settings'

export default function AboutPage() {
  const siteImages = useSiteImages()
  return (
    <section className="section container">
      <div className="split">
        <img src={siteImages.about_image || IMG_PLACEHOLDER} alt="L'artiste EBENORA" />
        <div>
          <span className="eyebrow">L'artiste</span>
          <h2>EBENORA</h2>
          <hr className="gold-rule" />
          <p className="muted">
            EBENORA est une démarche artistique inspirée des terres, de la lumière et de la mémoire.
            À travers des compositions chaleureuses, où le brun profond dialogue avec l'or et l'ocre,
            chaque œuvre cherche à créer une présence calme et enveloppante.
          </p>
          <p className="muted">
            Les tableaux sont proposés en reproductions soignées, imprimées sur des supports de qualité,
            afin que l'émotion de l'original puisse habiter votre intérieur.
          </p>
          <p className="muted">
            Une question, une œuvre sur mesure, une collaboration ? Écrivez-nous — c'est toujours un plaisir
            d'échanger autour de l'art.
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
