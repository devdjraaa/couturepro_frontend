export const mockUser = {
  id: 1,
  nom: 'Ousmane Diakité',
  telephone: '+225070123456',
  role: 'proprietaire',
  avatar: null,
  created_at: '2025-01-15T08:00:00Z',
}

export const mockAtelier = {
  id: 1,
  nom: 'Atelier Élégance',
  telephone: '+225070123456',
  adresse: 'Cocody, Abidjan',
  abonnement: {
    niveau: 'pro',
    statut: 'actif',
    expire_le: '2026-12-31',
    commandes_ce_mois: 8,
    clients_total: 12,
  },
  points: 285,
}

export const mockAuth = {
  user: mockUser,
  atelier: mockAtelier,
  token: 'mock-jwt-token-xyz-123',
}
