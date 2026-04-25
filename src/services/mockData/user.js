// Structure miroir de la réponse GET /auth/me (Proprietaire + atelierMaitre.abonnement)
export const mockUser = {
  id:                      'mock-user-uuid-001',
  nom:                     'Diakité',
  prenom:                  'Ousmane',
  telephone:               '+225070123456',
  email:                   'ousmane@atelierelégance.ci',
  telephone_verified_at:   '2025-01-15T08:00:00Z',
  role:                    'proprietaire',
  created_at:              '2025-01-15T08:00:00Z',
}

export const mockAtelier = {
  id:              'mock-atelier-uuid-001',
  proprietaire_id: 'mock-user-uuid-001',
  nom:             'Atelier Élégance',
  is_maitre:       true,
  statut:          'actif',
  essai_expire_at: null,
  created_at:      '2025-01-15T08:05:00Z',
  abonnement: {
    id:                  'mock-abo-uuid-001',
    atelier_id:          'mock-atelier-uuid-001',
    niveau_cle:          'standard_mensuel',
    statut:              'actif',
    jours_restants:      245,
    timestamp_debut:     '2025-01-15T08:05:00Z',
    timestamp_expiration:'2026-12-31T23:59:59Z',
  },
  // Champ pratique pour pointsService mock
  solde_pts: 285,
  historique: [],
  // Paramètres communications
  whatsapp_notifications_enabled: false,
  numero_whatsapp_atelier: '',
}

export const mockAuth = {
  user:    { ...mockUser },
  atelier: { ...mockAtelier },
  token:   'mock-jwt-token-xyz-123',
}
