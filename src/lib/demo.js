// Données de démonstration utilisées tant que Supabase n'est pas configuré.
// Permet de voir le site tout de suite. Remplacées par les vraies données dès que
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY sont renseignées et le catalogue rempli.

const F = (label, dimensions, price, stock) => ({ label, dimensions, price, stock })

export const DEMO_PAINTINGS = [
  {
    id: 'demo-1', title: 'Horizon Cuivré', category: 'Abstrait', featured: true, active: true,
    description: "Une composition abstraite aux tons chauds, où le cuivre rencontre l'ocre dans un mouvement lent et enveloppant.",
    images: [],
    formats: [F('Petit', '40 × 50 cm', 25000, 8), F('Moyen', '50 × 70 cm', 40000, 5), F('Grand', '80 × 120 cm', 65000, 3)],
    materials: ['toile', 'verre'], custom_allowed: true,
    created_at: '2026-07-01',
  },
  {
    id: 'demo-2', title: 'Silence Ocre', category: 'Abstrait', featured: true, active: true,
    description: 'Un aplat méditatif, pensé pour apaiser l’espace et capter la lumière du jour.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 25000, 10), F('Moyen', '50 × 70 cm', 40000, 6)],
    materials: ['toile'], custom_allowed: false,
    created_at: '2026-07-02',
  },
  {
    id: 'demo-3', title: 'Terre Promise', category: 'Paysage', featured: true, active: true,
    description: 'Un paysage stylisé aux horizons terreux, hommage à la chaleur des terres du Sahel.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 28000, 7), F('Moyen', '50 × 70 cm', 45000, 4)],
    materials: ['toile', 'verre'], custom_allowed: true,
    created_at: '2026-07-03',
  },
  {
    id: 'demo-4', title: 'Racines', category: 'Portrait', featured: false, active: true,
    description: 'Portrait graphique célébrant la mémoire et la transmission.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 30000, 6), F('Moyen', '50 × 70 cm', 48000, 3)],
    created_at: '2026-07-04',
  },
  {
    id: 'demo-5', title: 'Lumière du Soir', category: 'Paysage', featured: false, active: true,
    description: 'La douceur d’un crépuscule saisi en quelques touches chaudes.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 26000, 9), F('Moyen', '50 × 70 cm', 42000, 5)],
    created_at: '2026-07-05',
  },
  {
    id: 'demo-6', title: 'Éclats de Terre', category: 'Abstrait', featured: false, active: true,
    description: 'Fragments et matières, une texture riche à contempler de près.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 27000, 8)],
    created_at: '2026-07-06',
  },
  {
    id: 'demo-7', title: 'Songe Doré', category: 'Abstrait', featured: false, active: true,
    description: 'Un rêve suspendu, rehaussé de reflets dorés discrets.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 29000, 4), F('Grand', '80 × 120 cm', 70000, 2)],
    created_at: '2026-07-07',
  },
  {
    id: 'demo-8', title: 'Passage', category: 'Paysage', featured: false, active: true,
    description: 'Une invitation au voyage, entre ombre et lumière.',
    images: [],
    formats: [F('Petit', '40 × 50 cm', 26000, 7), F('Moyen', '50 × 70 cm', 43000, 4)],
    created_at: '2026-07-08',
  },
]

export const DEMO_CATEGORIES = ['Abstrait', 'Paysage', 'Portrait']
