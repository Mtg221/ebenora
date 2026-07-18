import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Message clair en dev si le .env n'est pas rempli
  console.warn(
    '[EBENORA] Variables Supabase manquantes. Copiez .env.example en .env et renseignez ' +
    'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '')

// true si la config Supabase est présente (utilisé pour afficher un mode démo sinon)
export const isConfigured = Boolean(url && anonKey)
