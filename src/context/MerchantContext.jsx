import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const MerchantContext = createContext(null)

export function MerchantProvider({ children }) {
  const [session,    setSession]    = useState(null)
  const [merchant,   setMerchant]   = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const initialized = useRef(false)

  async function loadMerchant(userId) {
    try {
      const { data: m } = await supabase
        .from('merchants').select('*').eq('id', userId).single()
      if (m) {
        setMerchant(m)
        const { data: r } = await supabase
          .from('restaurants').select('*').eq('id', m.restaurant_id).single()
        setRestaurant(r ?? null)
      } else {
        setMerchant(null); setRestaurant(null)
      }
    } catch {
      setMerchant(null); setRestaurant(null)
    }
  }

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // 1. Immediate session check — always resolves quickly
    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess)
      if (sess?.user?.id) await loadMerchant(sess.user.id)
      setLoading(false)
    }).catch(() => setLoading(false))

    // 2. Subscribe to subsequent auth changes (SIGNED_IN / SIGNED_OUT etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        // Skip INITIAL_SESSION — already handled by getSession above
        if (event === 'INITIAL_SESSION') return
        setSession(sess)
        if (sess?.user?.id) {
          await loadMerchant(sess.user.id)
        } else {
          setMerchant(null); setRestaurant(null)
        }
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null); setMerchant(null); setRestaurant(null)
  }

  function refreshRestaurant() {
    if (session?.user?.id) loadMerchant(session.user.id)
  }

  return (
    <MerchantContext.Provider value={{
      session, merchant, restaurant, loading,
      signIn, signOut, refreshRestaurant,
    }}>
      {children}
    </MerchantContext.Provider>
  )
}

export function useMerchant() {
  const ctx = useContext(MerchantContext)
  if (!ctx) throw new Error('useMerchant must be inside MerchantProvider')
  return ctx
}
