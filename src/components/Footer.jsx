import { Link } from 'react-router-dom'
import logo from '../assets/logo-footer.png'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <img src={logo} alt="EBENORA" className="brand-logo footer-logo" />
          <p style={{ maxWidth: 320, color: 'var(--beige-naturel)', marginTop: 16, fontSize: '0.92rem' }}>
            Reproductions d'art originales. Chaque œuvre est imprimée avec soin pour habiller vos espaces
            d'une présence chaleureuse et intemporelle.
          </p>
        </div>
        <div className="cols">
          <div>
            <h4>Explorer</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/galerie">Galerie</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:ebenorart.221@gmail.com">ebenorart.221@gmail.com</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><Link to="/admin">Administration</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} EBENORA — Tous droits réservés.
      </div>
    </footer>
  )
}
