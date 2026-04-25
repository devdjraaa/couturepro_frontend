// Structure miroir de GET /clients/{id}/mesures
// Tableau de mesures — une par type de vêtement (vetement_id)
// Les valeurs sont dans un objet `champs` (JSON dans le backend)
export const mockMesures = {
  'c-001': [
    {
      id: 'm-001', client_id: 'c-001', vetement_id: 'v-002',
      vetement: { id: 'v-002', nom: 'Robe' },
      champs: { longueur_robe: 120, tour_de_poitrine: 92, tour_de_taille: 70, tour_de_hanches: 96, longueur_manche: 58, epaules: 38, tour_de_bras: 28 },
      created_at: '2023-06-20T10:00:00Z', updated_at: '2026-03-15T10:00:00Z',
    },
  ],
  'c-003': [
    {
      id: 'm-002', client_id: 'c-003', vetement_id: 'v-001',
      vetement: { id: 'v-001', nom: 'Boubou' },
      champs: { longueur_totale: 125, tour_de_poitrine: 98, tour_de_taille: 80, tour_de_hanches: 102, longueur_manche: 60, epaules: 40 },
      created_at: '2023-03-25T09:00:00Z', updated_at: '2026-04-12T08:00:00Z',
    },
    {
      id: 'm-003', client_id: 'c-003', vetement_id: 'v-002',
      vetement: { id: 'v-002', nom: 'Robe' },
      champs: { longueur_robe: 125, tour_de_poitrine: 98, tour_de_taille: 80, tour_de_hanches: 102, longueur_manche: 60, epaules: 40, tour_de_bras: 32 },
      created_at: '2023-03-25T09:00:00Z', updated_at: '2026-04-12T08:00:00Z',
    },
  ],
  'c-005': [
    {
      id: 'm-004', client_id: 'c-005', vetement_id: 'v-003',
      vetement: { id: 'v-003', nom: 'Tailleur' },
      champs: { longueur_veste: 65, longueur_jupe: 60, tour_de_poitrine: 88, tour_de_taille: 68, tour_de_hanches: 92, epaules: 37 },
      created_at: '2023-11-05T07:00:00Z', updated_at: '2026-04-05T11:00:00Z',
    },
  ],
  'c-008': [
    {
      id: 'm-005', client_id: 'c-008', vetement_id: 'v-001',
      vetement: { id: 'v-001', nom: 'Boubou' },
      champs: { longueur_totale: 122, tour_de_poitrine: 90, tour_de_taille: 72, tour_de_hanches: 94, longueur_manche: 59, epaules: 39 },
      created_at: '2023-01-10T10:00:00Z', updated_at: '2026-04-14T10:00:00Z',
    },
    {
      id: 'm-006', client_id: 'c-008', vetement_id: 'v-002',
      vetement: { id: 'v-002', nom: 'Robe' },
      champs: { longueur_robe: 122, tour_de_poitrine: 90, tour_de_taille: 72, tour_de_hanches: 94, longueur_manche: 59, epaules: 39, tour_de_bras: 27 },
      created_at: '2023-01-10T10:00:00Z', updated_at: '2026-04-14T10:00:00Z',
    },
  ],
}
