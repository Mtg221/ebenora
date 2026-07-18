import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import logo from '../assets/logo-navbar.png'

export default function Navbar() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)} aria-label="EBENORA — Accueil">
          <img src={logo} alt="EBENORA" className="brand-logo" />
        </Link>

        <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/galerie">Galerie</NavLink>
          <NavLink to="/a-propos">À propos</NavLink>
          <NavLink to="/panier" className="cart-link">
            Panier {count > 0 && <span className="cart-badge">{count}</span>}
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
