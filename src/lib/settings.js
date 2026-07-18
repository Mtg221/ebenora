// Réglages de contenu du site (images éditoriales gérées depuis l'admin).
import { useEffect, useState } from 'react'
import { getSettings } from './api'

// Images éditables depuis l'onglet « Site » de l'administration.
export const SITE_IMAGES = [
  { key: 'hero_image',       label: 'Image du Hero (accueil)',        hint: "Grande image de fond, en haut de la page d'accueil." },
  { key: 'home_about_image', label: 'Image « À propos » (accueil)',   hint: 'Illustration de la section À propos sur l’accueil.' },
  { key: 'about_image',      label: 'Image de la page À propos',      hint: "Portrait ou atelier affiché sur la page À propos." },
]

// Placeholder sobre (aux couleurs de la marque) affiché tant qu'aucune image n'est définie.
export const IMG_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#DCCBB3"/><text x="50%" y="50%" font-family="Cormorant Garamond, serif" font-size="34" letter-spacing="6" fill="#7A5233" text-anchor="middle" dominant-baseline="middle">EBENORA</text></svg>`
)

// Hook : charge les images du site (objet { key: url }). Vide en mode démo.
export function useSiteImages() {
  const [images, setImages] = useState({})
  useEffect(() => {
    let alive = true
    getSettings().then((s) => { if (alive) setImages(s) }).catch(() => {})
    return () => { alive = false }
  }, [])
  return images
}
