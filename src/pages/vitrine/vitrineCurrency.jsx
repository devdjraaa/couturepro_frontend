import { createContext, useContext, useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'

// Taux INDICATIFS (base FCFA/XOF). À remplacer plus tard par une API de taux quotidiens.
// rate = montant de la devise pour 1 FCFA.
export const DEVISES = {
  XOF: { code: 'FCFA', rate: 1,           dec: 0 },
  NGN: { code: '₦',    rate: 2.5,         dec: 0 },
  USD: { code: '$',    rate: 1 / 600,     dec: 0 },
  EUR: { code: '€',    rate: 1 / 655.957, dec: 0 },
}

const KEY = 'gx_devise'
const CurrencyCtx = createContext(null)

export function VitrineCurrencyProvider({ children }) {
  const [devise, setDeviseState] = useState(() => {
    try { const v = localStorage.getItem(KEY); return v && DEVISES[v] ? v : 'XOF' } catch { return 'XOF' }
  })

  const setDevise = useCallback((d) => {
    if (!DEVISES[d]) return
    try { localStorage.setItem(KEY, d) } catch { /* stockage indisponible */ }
    setDeviseState(d)
  }, [])

  const format = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === '') return null
    const n = Number(String(amount).replace(/\s/g, '').replace(',', '.'))
    if (!isFinite(n)) return null
    const cfg = DEVISES[devise]
    const v = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: cfg.dec }).format(n * cfg.rate)
    return `${v} ${cfg.code}`
  }, [devise])

  return <CurrencyCtx.Provider value={{ devise, setDevise, format }}>{children}</CurrencyCtx.Provider>
}

export function useDevise() {
  const ctx = useContext(CurrencyCtx)
  if (!ctx) return { devise: 'XOF', setDevise: () => {}, format: (a) => (a == null ? null : `${a} FCFA`) }
  return ctx
}

/** Layout des routes vitrine : fournit le contexte devise à toutes les pages. */
export function VitrineLayout() {
  return (
    <VitrineCurrencyProvider>
      <Outlet />
    </VitrineCurrencyProvider>
  )
}
