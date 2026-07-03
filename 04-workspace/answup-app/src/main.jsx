import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import Login from './Login.jsx'
import AdminLogin from './AdminLogin.jsx'
import Onboard from './Onboard.jsx'
import { supabase } from './lib/supabase'
import { initTheme } from './brand.jsx'

initTheme()

// Admin accounts: Google (Fahad) + the email/password console account
const ADMIN_EMAILS = ['fahadimdad966@gmail.com', 'admin@answup.com']

function Root() {
  const [route, setRoute] = useState(window.location.pathname)
  const [session, setSession] = useState(null)
  const [client, setClient] = useState(null)     // this user's onboarding row (or null)
  const [loading, setLoading] = useState(true)

  const go = (path) => { window.history.pushState({}, '', path); setRoute(path) }

  // Track browser back/forward
  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Track auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // When logged in, load this user's client/onboarding row
  useEffect(() => {
    if (!session?.user) { setClient(null); return }
    supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setClient(data))
  }, [session])

  const signOut = async () => { await supabase.auth.signOut(); setClient(null); go('/') }

  // ---- Admin portal (/admin): email + password entry for Answup staff ----
  if (route.startsWith('/admin')) {
    if (loading) return <div className="boot">Loading…</div>
    const isAdminSession = session && ADMIN_EMAILS.includes((session.user.email || '').toLowerCase())
    if (!isAdminSession) return <AdminLogin />
    return <Dashboard user={session.user} client={client} isAdmin={true} onBack={() => go('/')} onSignOut={signOut} />
  }

  // ---- Public marketing site ----
  if (!route.startsWith('/dashboard')) {
    return <App
      onDashboard={() => go('/dashboard')}
      onStart={(plan) => {
        if (plan) localStorage.setItem('answup-plan', plan)
        go('/dashboard')
      }}
    />
  }

  // ---- App area (/dashboard) ----
  if (loading) return <div className="boot">Loading…</div>

  // Not signed in → login
  if (!session) return <Login onBack={() => go('/')} />

  const isAdmin = ADMIN_EMAILS.includes((session.user.email || '').toLowerCase())

  // Signed in but hasn't onboarded yet (and isn't admin) → onboarding
  if (!client && !isAdmin) {
    return <Onboard user={session.user} onDone={() => window.location.reload()} />
  }

  // Signed in + onboarded (or admin) → dashboard
  return <Dashboard user={session.user} client={client} isAdmin={isAdmin} onBack={() => go('/')} onSignOut={signOut} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
