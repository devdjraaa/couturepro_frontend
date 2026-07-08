import { schemaMigrations, createTable } from '@nozbe/watermelondb/Schema/migrations'

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
  ],
})
