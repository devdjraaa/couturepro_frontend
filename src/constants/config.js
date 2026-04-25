export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const USE_MOCKS    = import.meta.env.VITE_USE_MOCKS === 'true'

export const APP_VERSION = '1.0.0'

// TanStack Query
export const QUERY_STALE_TIME    = 5 * 60 * 1000  // 5 min
export const QUERY_CACHE_TIME    = 10 * 60 * 1000 // 10 min
export const QUERY_RETRY_COUNT   = 2

// UX
export const DEBOUNCE_SEARCH_MS  = 300
export const MIN_SEARCH_LENGTH   = 2
export const TOAST_DURATION_MS   = 3000
export const OTP_RESEND_DELAY_S  = 60

// Quotas par niveau_cle (miroir backend — clés de la table niveaux_config)
// -1 = illimité ; les limites réelles sont dans config_snapshot de l'abonnement
export const QUOTA_LIMITS = {
  gratuit:           { clients: 10,  commandes_par_mois: 20  },
  standard_mensuel:  { clients: 50,  commandes_par_mois: 100 },
  premium_mensuel:   { clients: -1,  commandes_par_mois: -1  },
  standard_annuel:   { clients: 50,  commandes_par_mois: 100 },
  premium_annuel:    { clients: -1,  commandes_par_mois: -1  },
}

// Prix des abonnements (XOF)
export const ABONNEMENT_PRIX = {
  starter: { mensuel: 2500,  annuel: 25000  },
  pro:     { mensuel: 5000,  annuel: 50000  },
  magnat:  { mensuel: 10000, annuel: 100000 },
}

// Points de fidélité
export const POINTS_PAR_1000_XOF   = 1
export const POINTS_PARRAINAGE      = 50
export const POINTS_FIDELITE_MOIS  = 5
export const POINTS_VERS_JOURS     = 10  // 10 points = 1 jour d'abonnement
