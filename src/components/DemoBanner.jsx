import { isConfigured } from '../lib/supabase'

export default function DemoBanner() {
  if (isConfigured) return null
  return (
    <div className="demo-banner">
      <b>Mode démonstration</b> — données d'exemple. Configurez Supabase (<code>.env</code>) pour activer le vrai catalogue.
    </div>
  )
}
