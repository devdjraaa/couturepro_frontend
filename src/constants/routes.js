export const ROUTES = {
  // Auth (public)
  LOGIN:            '/login',
  REGISTER:         '/register',
  OTP:              '/verification',
  FORGOT_PASSWORD:  '/mot-de-passe-oublie',
  RECOVER_ACCOUNT:  '/recuperer-compte',
  ONBOARDING:       '/onboarding',

  // App (protégées)
  DASHBOARD:        '/',

  // Clients
  CLIENTS:          '/clients',
  CLIENT_DETAIL:    '/clients/:id',

  // Commandes
  COMMANDES:        '/commandes',
  COMMANDE_NEW:     '/commandes/new',
  COMMANDE_DETAIL:  '/commandes/:id',

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

  // Paramètres
  PARAMETRES:       '/parametres',
  PROFIL:           '/parametres/profil',
  COMMUNICATIONS:   '/parametres/communications',
  THEME:            '/parametres/theme',
  APROPOS:          '/parametres/a-propos',

  // Autres
  PHOTOS_VIP:  '/photos-vip',
  HISTORIQUE:  '/historique',
  FAQ:         '/faq',
  CONTACT:     '/contact',
  SUPPORT:          '/support',
  SUPPORT_TICKET:   '/support/tickets/:id',
}

export const toSupportTicket = (id) => `/support/tickets/${id}`

// Helpers pour les routes dynamiques
export const toClientDetail    = (id) => `/clients/${id}`
export const toCommandeDetail  = (id) => `/commandes/${id}`
