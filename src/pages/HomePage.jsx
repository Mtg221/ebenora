import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPaintings } from '../lib/api'
import { useSiteImages, IMG_PLACEHOLDER } from '../lib/settings'
import PaintingCard from '../components/PaintingCard'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const siteImages = useSiteImages()

  useEffect(() => {
    getPaintings({ featured: true })
      .then((d) => setFeatured(d.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        {siteImages.hero_image && (
          <div className="hero-media"><img src={siteImages.hero_image} alt="" /></div>
        )}
        <div className="hero-inner">
          <span className="eyebrow">Galerie d'art · Éditions limitées</span>
          <h1>L'art qui habite vos murs</h1>
          <p>
            Chaque mur mérite une œuvre. EBENORA sélectionne des créations artistiques
            pensées pour sublimer votre intérieur. Des œuvres élégantes, imprimées avec
            exigence, pour transformer un espace en un lieu qui vous ressemble.
          </p>
          <div className="hero-actions">
            <Link to="/galerie" className="btn">Découvrir la galerie</Link>
            <Link to="/a-propos" className="btn btn-outline" style={{ color: 'var(--ivoire-doux)', borderColor: 'var(--ivoire-doux)' }}>Notre univers</Link>
          </div>
        </div>
      </section>

      {/* Sélection */}
      <section className="section container">
        <div className="section-head center center">
          <span className="eyebrow">Sélection</span>
          <h2>Œuvres à l'honneur</h2>
          <hr className="gold-rule" />
        </div>
        {loading ? (
          <div className="spinner" />
        ) : featured.length ? (
          <div className="grid">
            {featured.map((p) => <PaintingCard key={p.id} painting={p} />)}
          </div>
        ) : (
          <p className="empty">Bientôt de nouvelles œuvres.</p>
        )}
        <div className="center" style={{ marginTop: 44 }}>
          <Link to="/galerie" className="btn btn-outline">Voir toute la galerie</Link>
        </div>
      </section>

      {/* Comment commander */}
      <section className="how">
        <div className="section container" style={{ paddingTop: 64, paddingBottom: 64 }}>
          <div className="section-head center center">
            <span className="eyebrow">Simple & sans engagement</span>
            <h2>Comment commander ?</h2>
            <hr className="gold-rule" />
            <p className="muted">Aucun paiement en ligne — le règlement se fait en direct avec nous.</p>
          </div>
          <div className="steps">
            {[
              { t: 'Parcourez la galerie', d: 'Explorez les œuvres et trouvez celle qui vous touche.' },
              { t: 'Choisissez le format', d: 'Sélectionnez la taille souhaitée et ajoutez au panier.' },
              { t: 'Passez commande', d: 'Renseignez simplement vos coordonnées, sans créer de compte.' },
              { t: 'Nous vous recontactons', d: 'Nous confirmons votre commande par email ou téléphone.' },
              { t: 'Réglez en direct', d: 'Le paiement se convient ensemble, en toute confiance.' },
              { t: 'Recevez votre œuvre', d: 'Votre reproduction est préparée avec soin et livrée.' },
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 40 }}>
            <Link to="/galerie" className="btn">Commencer</Link>
          </div>
        </div>
      </section>

      {/* À propos */}
      <section className="section container">
        <div className="split">
          <img src={siteImages.home_about_image || IMG_PLACEHOLDER} alt="Atelier EBENORA" />
          <div>
            <span className="eyebrow">La maison EBENORA</span>
            <h2>Un art chaleureux, ancré et sincère</h2>
            <hr className="gold-rule" />
            <p className="muted">
              Chaque œuvre naît d'une recherche patiente autour de la matière, de la lumière et des
              terres. Les reproductions sont réalisées sur des supports de qualité pour restituer la
              profondeur des tons et la finesse des détails.
            </p>
            <p className="muted">
              Commandez en quelques clics : nous vous recontactons pour finaliser le règlement et
              organiser la livraison.
            </p>
            <Link to="/a-propos" className="btn btn-ghost" style={{ paddingLeft: 0 }}>En savoir plus →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
