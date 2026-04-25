// Structure miroir de la réponse GET /vetements (Vetement model du backend)
// libelles_mesures: tableau de chaînes (noms des champs de mesure)
export const mockVetements = [
  {
    id: 'v-001', nom: 'Boubou',
    libelles_mesures: ['longueur_totale', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'longueur_manche', 'epaules'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-002', nom: 'Robe',
    libelles_mesures: ['longueur_robe', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'longueur_manche', 'epaules', 'tour_de_bras'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-003', nom: 'Tailleur',
    libelles_mesures: ['longueur_veste', 'longueur_jupe', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'epaules'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-004', nom: 'Ensemble',
    libelles_mesures: ['longueur_haut', 'longueur_bas', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-005', nom: 'Pantalon',
    libelles_mesures: ['longueur_pantalon', 'tour_de_taille', 'tour_de_hanches', 'tour_de_cuisse', 'entrejambe'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-006', nom: 'Chemise / Blouse',
    libelles_mesures: ['longueur_dos', 'tour_de_poitrine', 'tour_de_taille', 'epaules', 'longueur_manche', 'tour_de_cou'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-007', nom: 'Kabà',
    libelles_mesures: ['longueur_totale', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'epaules'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-008', nom: 'Robe de mariée',
    libelles_mesures: ['longueur_robe', 'tour_de_poitrine', 'tour_de_taille', 'tour_de_hanches', 'longueur_manche', 'epaules', 'longueur_traine'],
    is_systeme: true, is_archived: false,
  },
  {
    id: 'v-009', nom: 'Jupe',
    libelles_mesures: ['longueur_jupe', 'tour_de_taille', 'tour_de_hanches'],
    is_systeme: true, is_archived: false,
  },
]
