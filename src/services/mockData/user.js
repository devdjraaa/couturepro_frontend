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
    niveau_label:        'Standard Mensuel',
    statut:              'actif',
    jours_restants:      245,
    timestamp_debut:     '2025-01-15T08:05:00Z',
    timestamp_expiration:'2026-12-31T23:59:59Z',
    config: {
      max_assistants:          0,
      max_membres:             0,
      max_clients_par_mois:    50,
      max_photos_vip_par_mois: null,
      max_factures_par_mois:   0,
      pts_par_client:          1,
      pts_par_commande:        1,
      pts_activation:          31,
      seuil_conversion_pts:    10000,
      photos_vip:              false,
      facture_whatsapp:        false,
      sauvegarde_auto:         false,
      module_caisse:           false,
      multi_ateliers:          false,
      export_pdf:              true,
    },
    quota_factures: null,
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
