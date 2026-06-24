import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

// Devises supportées. `rate` = montant pour 1 FCFA — sert de REPLI si l'API de
// taux est indisponible (open.er-api.com, gratuite, sans clé).
export const DEVISES = {
  XOF: { code: 'FCFA', rate: 1,           dec: 0 },
  NGN: { code: '₦',    rate: 2.5,         dec: 0 },
  USD: { code: '$',    rate: 1 / 600,     dec: 0 },
  EUR: { code: '€',    rate: 1 / 655.957, dec: 0 },
}

const KEY = 'gx_devise'
const FX_KEY = 'gx_fx'
const CurrencyCtx = createContext(null)

const today = () => new Date().toISOString().slice(0, 10)
const staticRates = () => Object.fromEntries(Object.entries(DEVISES).map(([k, v]) => [k, v.rate]))

function loadFx() {
  try {
    const c = JSON.parse(localStorage.getItem(FX_KEY))
    if (c && c.date === today() && c.rates) return c.rates
  } catch { /* ignore */ }
  return null
}

export function VitrineCurrencyProvider({ children }) {
  const [devise, setDeviseState] = useState(() => {
    try { const v = localStorage.getItem(KEY); return v && DEVISES[v] ? v : 'XOF' } catch { return 'XOF' }
  })
  const [rates, setRates] = useState(() => loadFx() || staticRates())

  // Taux du jour (mis en cache 1×/jour). Repli silencieux sur les taux statiques.
  useEffect(() => {
    if (loadFx()) return
    fetch('https://open.er-api.com/v6/latest/XOF')
      .then((r) => r.json())
      .then((d) => {
        if (!d || !d.rates) return
        const next = {
          XOF: 1,
          NGN: d.rates.NGN ?? DEVISES.NGN.rate,
          USD: d.rates.USD ?? DEVISES.USD.rate,
          EUR: d.rates.EUR ?? DEVISES.EUR.rate,
        }
        setRates(next)
        try { localStorage.setItem(FX_KEY, JSON.stringify({ date: today(), rates: next })) } catch { /* ignore */ }
      })
      .catch(() => { /* hors-ligne : on garde les taux statiques */ })
  }, [])

  const setDevise = useCallback((d) => {
    if (!DEVISES[d]) return
    try { localStorage.setItem(KEY, d) } catch { /* indisponible */ }
    setDeviseState(d)
  }, [])

  const format = useCallback((amount) => {
    if (amount === null || amount === undefined || amount === '') return null
    const n = Number(String(amount).replace(/\s/g, '').replace(',', '.'))
    if (!isFinite(n)) return null
    const cfg = DEVISES[devise]
    const rate = rates[devise] ?? cfg.rate
    const v = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: cfg.dec }).format(n * rate)
    return `${v} ${cfg.code}`
  }, [devise, rates])

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
