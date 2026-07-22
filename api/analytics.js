// Fonction serverless Vercel — proxy sécurisé vers l'API Web Analytics de Vercel.
//
// Le navigateur ne peut pas appeler l'API Vercel directement (le token doit rester
// secret). Cette fonction garde le token côté serveur, vérifie que l'appelant est un
// administrateur connecté (JWT Supabase), puis agrège les métriques de trafic.
//
// Variables d'environnement attendues (Project Settings → Environment Variables) :
//   VERCEL_TOKEN       Vercel Access Token (Account Settings → Tokens)
//   VERCEL_PROJECT_ID  ID du projet (prj_…)
//   VERCEL_TEAM_ID     ID de l'équipe (team_…) — uniquement si le projet appartient à une équipe
//   SUPABASE_URL       URL du projet Supabase (même valeur que VITE_SUPABASE_URL)
//   SUPABASE_ANON_KEY  clé anon Supabase (même valeur que VITE_SUPABASE_ANON_KEY)

const VERCEL_API = 'https://api.vercel.com/v1/query/web-analytics'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Méthode non autorisée' })
    return
  }

  // ── Protection : l'appelant doit être un utilisateur Supabase authentifié ──
  const auth = req.headers.authorization || ''
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!jwt) {
    res.status(401).json({ error: 'Authentification requise' })
    return
  }
  const check = await verifySupabaseUser(jwt)
  if (!check.ok) {
    res.status(check.status === 500 ? 500 : 403).json({ error: check.error })
    return
  }

  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID
  if (!token || !projectId) {
    res.status(500).json({ error: 'Analytics non configuré (VERCEL_TOKEN / VERCEL_PROJECT_ID manquant)' })
    return
  }

  // ── Période demandée (1 = 24 h, 7 ou 30 jours) ──
  const days = req.query.days === '30' ? 30 : req.query.days === '1' ? 1 : 7
  const trendBy = days === 1 ? 'hour' : 'day'
  const until = new Date()
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000)
  // Granularité horaire → dates ISO complètes ; sinon dates AAAA-MM-JJ.
  const fmt = (d) => (days === 1 ? d.toISOString() : d.toISOString().slice(0, 10))
  const base = {
    projectId,
    ...(teamId ? { teamId } : {}),
    since: fmt(since),
    until: fmt(until),
  }

  const call = (path, params) =>
    fetchVercel(token, path, { ...base, ...params }).catch(() => null)

  try {
    const [total, daily, routes, referrers, countries, devices] = await Promise.all([
      call('visits/count', {}),
      call('visits/aggregate', { by: trendBy }),
      call('visits/aggregate', { by: 'route', limit: '8' }),
      call('visits/aggregate', { by: 'referrerHostname', limit: '8' }),
      call('visits/aggregate', { by: 'country', limit: '8' }),
      call('visits/aggregate', { by: 'deviceType', limit: '6' }),
    ])

    // Cache court côté edge pour éviter de marteler l'API Vercel.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      days,
      trendBy,
      totals: total?.data || { pageviews: 0, visitors: 0 },
      daily: daily?.data || [],
      routes: routes?.data || [],
      referrers: referrers?.data || [],
      countries: countries?.data || [],
      devices: devices?.data || [],
    })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Erreur API Vercel' })
  }
}

async function fetchVercel(token, path, params) {
  const qs = new URLSearchParams(params).toString()
  const r = await fetch(`${VERCEL_API}/${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) throw new Error(`Vercel ${path}: ${r.status}`)
  return r.json()
}

// Valide le JWT en interrogeant l'endpoint /auth/v1/user de Supabase.
// Retourne { ok, status, error } pour un diagnostic précis.
async function verifySupabaseUser(jwt) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return { ok: false, status: 500, error: 'Configuration Supabase manquante côté serveur' }
  }
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${jwt}`, apikey: anon },
    })
    if (!r.ok) {
      return { ok: false, status: 403, error: `Session non validée par Supabase (${r.status})` }
    }
    const user = await r.json()
    if (!user?.id) return { ok: false, status: 403, error: 'Utilisateur introuvable' }
    return { ok: true }
  } catch (err) {
    return { ok: false, status: 500, error: `Vérification Supabase impossible : ${err.message}` }
  }
}
