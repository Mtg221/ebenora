// Tailles standards des tableaux EBENORA.
// Utilisées par le formulaire admin (menu déroulant) et le filtre de la galerie.
// Un tableau peut proposer une, plusieurs ou toutes ces tailles.

// price = prix de référence en FCFA, pré-rempli dans l'admin (modifiable par œuvre).
export const SIZES = [
  { label: 'Petit', dimensions: '40 × 50 cm', price: 30000 },
  { label: 'Moyen', dimensions: '50 × 70 cm', price: 50000 },
  { label: 'Grand', dimensions: '80 × 120 cm', price: 75000 },
]

// Vrai si le tableau propose au moins un format de cette taille (par label).
export function hasSize(painting, sizeLabel) {
  return (painting.formats || []).some((f) => f.label === sizeLabel)
}

// Matières de cadre proposées. `value` est stocké en base, `label` affiché.
export const MATERIALS = [
  { value: 'toile', label: 'Impression sur toile' },
  { value: 'verre', label: 'Impression sur papier (sous verre)' },
]

// Libellé lisible d'une matière à partir de sa valeur stockée.
export function materialLabel(value) {
  return MATERIALS.find((m) => m.value === value)?.label || value
}
