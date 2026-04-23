export const ROUTES = {
  // Auth (public)
  LOGIN:            '/login',
  REGISTER:         '/inscription',
  OTP:              '/verification',
  FORGOT_PASSWORD:  '/mot-de-passe-oublie',
  RECOVER_ACCOUNT:  '/recuperer-compte',

  // App (protégées)
  DASHBOARD:        '/',

  // Clients
  CLIENTS:          '/clients',
  CLIENT_DETAIL:    '/clients/:id',

  // Commandes
  COMMANDES:        '/commandes',
  COMMANDE_DETAIL:  '/commandes/:id',

  // Mesures
  MESURES:          '/mesures',

  // Vêtements
  VETEMENTS:        '/vetements',

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
}

// Helpers pour les routes dynamiques
export const toClientDetail    = (id) => `/clients/${id}`
export const toCommandeDetail  = (id) => `/commandes/${id}`
