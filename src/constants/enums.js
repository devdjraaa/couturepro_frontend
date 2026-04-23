// Miroir exact des valeurs enum du backend Laravel

export const COMMANDE_STATUT = {
  EN_COURS: 'en_cours',
  ESSAI:    'essai',
  LIVRE:    'livre',
  ANNULE:   'annule',
}

export const ROLE = {
  PROPRIETAIRE: 'proprietaire',
  ASSISTANT:    'assistant',
  MEMBRE:       'membre',
}

export const TYPE_PROFIL_CLIENT = {
  VIP:         'vip',
  REGULIER:    'regulier',
  OCCASIONNEL: 'occasionnel',
}

export const ABONNEMENT_NIVEAU = {
  GRATUIT: 'gratuit',
  STARTER: 'starter',
  PRO:     'pro',
  MAGNAT:  'magnat',
}

export const ABONNEMENT_STATUT = {
  ACTIF:      'actif',
  EXPIRE:     'expire',
  EN_ATTENTE: 'en_attente',
}

export const PAIEMENT_STATUT = {
  EN_ATTENTE: 'en_attente',
  VALIDE:     'valide',
  ECHOUE:     'echoue',
  REMBOURSE:  'rembourse',
}

export const NOTIFICATION_TYPE = {
  COMMANDE:    'commande',
  ABONNEMENT:  'abonnement',
  SYSTEME:     'systeme',
  PAIEMENT:    'paiement',
}

export const THEME = {
  CLAIR:   'light',
  SOMBRE:  'dark',
  SYSTEME: 'system',
}

// Couleurs des statuts — utilisées par StatusBadge et CommandeCard
export const STATUT_COLORS = {
  en_cours: { bg: 'bg-primary-50',   text: 'text-primary-700',  border: 'border-primary-200',  dot: 'bg-primary'   },
  essai:    { bg: 'bg-accent-50',    text: 'text-amber-700',    border: 'border-amber-200',    dot: 'bg-accent'    },
  livre:    { bg: 'bg-emerald-50',   text: 'text-emerald-700',  border: 'border-emerald-200',  dot: 'bg-success'   },
  annule:   { bg: 'bg-red-50',       text: 'text-red-700',      border: 'border-red-200',      dot: 'bg-danger'    },
  expire:   { bg: 'bg-stone-100',    text: 'text-stone-600',    border: 'border-stone-200',    dot: 'bg-ghost'     },
  actif:    { bg: 'bg-emerald-50',   text: 'text-emerald-700',  border: 'border-emerald-200',  dot: 'bg-success'   },
  en_retard:{ bg: 'bg-terra-50',     text: 'text-terra',        border: 'border-orange-200',   dot: 'bg-terra'     },
}

// Couleur de la bande latérale de CommandeCard selon statut
export const COMMANDE_BANDE_COLORS = {
  en_cours:  'bg-primary',
  essai:     'bg-accent',
  livre:     'bg-success',
  annule:    'bg-danger',
  en_retard: 'bg-terra',
}
