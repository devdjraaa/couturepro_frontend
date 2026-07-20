import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'

// v1 → v2 : tables ajoutées pour le full-offline (collections, notifications, paiements).
export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'collections',
          columns: [
            { name: 'nom',        type: 'string' },
            { name: 'atelier_id', type: 'string' },
            { name: 'synced_at',  type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'notifications',
          columns: [
            { name: 'titre',         type: 'string' },
            { name: 'contenu',       type: 'string', isOptional: true },
            { name: 'type',          type: 'string', isOptional: true },
            { name: 'is_read',       type: 'boolean' },
            { name: 'atelier_id',    type: 'string', isOptional: true },
            { name: 'date_creation', type: 'string', isOptional: true },
            { name: 'synced_at',     type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'paiements',
          columns: [
            { name: 'commande_id',    type: 'string' },
            { name: 'atelier_id',     type: 'string' },
            { name: 'montant',        type: 'number' },
            { name: 'mode_paiement',  type: 'string', isOptional: true },
            { name: 'enregistre_par', type: 'string', isOptional: true },
            { name: 'date_paiement',  type: 'string', isOptional: true },
            { name: 'synced_at',      type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'commande_items',
          columns: [
            { name: 'commande_id',   type: 'string' },
            { name: 'vetement_id',   type: 'string', isOptional: true },
            { name: 'vetement_nom',  type: 'string', isOptional: true },
            { name: 'quantite',      type: 'number' },
            { name: 'prix_unitaire', type: 'number' },
            { name: 'description',   type: 'string', isOptional: true },
            { name: 'synced_at',     type: 'number', isOptional: true },
          ],
        }),
        createTable({
          name: 'commande_echeances',
          columns: [
            { name: 'commande_id',   type: 'string' },
            { name: 'date_echeance', type: 'string' },
            { name: 'note',          type: 'string', isOptional: true },
            { name: 'livree',        type: 'boolean' },
            { name: 'livree_at',     type: 'string', isOptional: true },
            { name: 'synced_at',     type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'commandes',
          columns: [
            { name: 'reference', type: 'string', isOptional: true },
            { name: 'etape',     type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        addColumns({
          table: 'notifications',
          columns: [
            { name: 'lien', type: 'string', isOptional: true }, // deep-link au tap
          ],
        }),
      ],
    },
    // v5 → v6 : REL-3, cache hors ligne de « Mes Réalisations ».
    {
      toVersion: 6,
      steps: [
        createTable({
          name: 'realisations',
          columns: [
            { name: 'titre',        type: 'string' },
            { name: 'description',  type: 'string',  isOptional: true },
            { name: 'statut',       type: 'string' },
            { name: 'images_json',  type: 'string',  isOptional: true },
            { name: 'motif_refus',  type: 'string',  isOptional: true },
            { name: 'soumis_at',    type: 'string',  isOptional: true },
            { name: 'publie_at',    type: 'string',  isOptional: true },
            { name: 'date_creation', type: 'string', isOptional: true },
            { name: 'atelier_id',   type: 'string',  isOptional: true },
            { name: 'synced_at',    type: 'number',  isOptional: true },
          ],
        }),
      ],
    },
  ],
})
