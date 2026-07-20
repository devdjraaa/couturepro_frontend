// Plateforme : sur le web, « / » est la vitrine publique et l'app vit sous /app.
// Sur mobile (Capacitor), l'app garde « / » (la vitrine n'est pas montée).
export const IS_NATIVE =
  typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.()

export const ROUTES = {
  // Auth (public)
  LOGIN:            '/login',
  REGISTER:         '/register',
  OTP:              '/verification',
  FORGOT_PASSWORD:  '/mot-de-passe-oublie',
  RECOVER_ACCOUNT:  '/recuperer-compte',
  LOGIN_SECRET_Q:   '/recuperer-compte/question-secrete',
  ONBOARDING:       '/onboarding',
  BIENVENUE:        '/bienvenue',

  // Vitrine publique (web uniquement)
  VITRINE:           '/',
  VITRINE_CREATEURS: '/createurs',
  VITRINE_CREATEUR:  '/createurs/:slug',
  VITRINE_SUIVI:     '/suivi',
  VITRINE_ABOUT:     '/qui-sommes-nous',
  VITRINE_AIDE:      '/aide',
  VITRINE_ARTISANS:  '/artisans',
  VITRINE_PARTENAIRES: '/partenaires',
  VITRINE_FAVORIS:   '/favoris',
  VITRINE_INSCRIPTION:      '/inscription',
  VITRINE_SPONSORISATION:   '/mise-en-avant',
  VITRINE_ESPACE_CLIENT:    '/espace-client',

  // Pages légales vitrine
  VITRINE_CONFIDENTIALITE:    '/confidentialite',
  VITRINE_MENTIONS:           '/mentions-legales',
  VITRINE_COOKIES:            '/cookies',
  VITRINE_PROTECTION_DONNEES: '/protection-donnees',
  VITRINE_CGU:                '/cgu',
  VITRINE_DROITS_CREATEURS:   '/droits-createurs',
  VITRINE_CONDITIONS_VENTE:   '/conditions-vente',
  VITRINE_PRODUITS_INTERDITS: '/produits-interdits',
  VITRINE_LIVRAISON_RETOURS:  '/livraison-retours',
  VITRINE_REGLES_COMMUNAUTE:  '/regles-communaute',
  VITRINE_CONTACT_RECLAMATIONS: '/contact-reclamations',

  // App (protégées) — '/app' sur le web, '/' sur mobile
  DASHBOARD:        IS_NATIVE ? '/' : '/app',
  MA_VITRINE:       '/ma-vitrine',

  // Clients
  CLIENTS:          '/clients',
  CLIENT_DETAIL:    '/clients/:id',

  // Commandes
  COMMANDES:        '/commandes',
  COMMANDE_NEW:     '/commandes/new',
  COMMANDE_DETAIL:  '/commandes/:id',

  // Commandes groupées
  COMMANDE_GROUPE_NEW:    '/commandes/groupes/nouveau',
  COMMANDE_GROUPE_DETAIL: '/commandes/groupes/:id',

  // Vêtements (CataloguePage)
  VETEMENTS:        '/catalogue',

  // Mesures (accessibles via ClientDetailPage — pas de page standalone)
  MESURES:          '/mesures',

  // Abonnement
  ABONNEMENT:       '/abonnement',

  // Points
  POINTS:           '/points',

  // Équipe
  EQUIPE:           '/equipe',

  // Notifications
  NOTIFICATIONS:    '/notifications',
  INFOS:         '/infos',   // CLI-2 — « Gextimo Infos », distinct des notifications

  // Paramètres
  PARAMETRES:       '/parametres',
  PROFIL:           '/parametres/profil',
  COMMUNICATIONS:   '/parametres/communications',
  THEME:            '/parametres/theme',
  APROPOS:          '/parametres/a-propos',

  // Facturation
  FACTURATION: '/facturation',

  // Outils créatifs
  OUTILS_CREATIFS: '/outils-creatifs',
  STUDIO: '/studio',

  // Autres
  PHOTOS_VIP:  '/photos-vip',
  REALISATIONS: '/realisations',
  HISTORIQUE:  '/historique',
  FAQ:         '/faq',
  CONTACT:     '/contact',
  SUPPORT:          '/support',
  SUPPORT_TICKET:   '/support/tickets/:id',
}

export const toSupportTicket = (id) => `/support/tickets/${id}`

// Helpers pour les routes dynamiques
export const toClientDetail        = (id) => `/clients/${id}`
export const toCommandeDetail      = (id) => `/commandes/${id}`
export const toCommandeGroupeDetail = (id) => `/commandes/groupes/${id}`
