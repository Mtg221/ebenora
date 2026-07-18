// Formatage des prix. Devise par défaut : FCFA (XOF). Ajustez ici si besoin.
export function formatPrice(value) {
  const n = Number(value) || 0
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA'
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
