import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 6,
  tables: [
    tableSchema({
      name: 'clients',
      columns: [
        { name: 'nom',            type: 'string' },
        { name: 'prenom',         type: 'string', isOptional: true },
        { name: 'telephone',      type: 'string' },
        { name: 'type_profil',    type: 'string' },
        { name: 'avatar_index',   type: 'number', isOptional: true },
        { name: 'is_vip',         type: 'boolean' },
        { name: 'is_archived',    type: 'boolean' },
        { name: 'notes',          type: 'string', isOptional: true },
        { name: 'atelier_id',     type: 'string' },
        { name: 'created_by',     type: 'string', isOptional: true },
        { name: 'synced_at',      type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'commandes',
      columns: [
        { name: 'client_id',                type: 'string' },
        { name: 'vetement_id',              type: 'string', isOptional: true },
        { name: 'reference',                type: 'string', isOptional: true },
        { name: 'etape',                    type: 'string', isOptional: true },
        { name: 'client_nom',               type: 'string', isOptional: true },
        { name: 'vetement_nom',             type: 'string', isOptional: true },
        { name: 'quantite',                 type: 'number', isOptional: true },
        { name: 'prix',                     type: 'number' },
        { name: 'acompte',                  type: 'number', isOptional: true },
        { name: 'mode_paiement_acompte',    type: 'string', isOptional: true },
        { name: 'statut',                   type: 'string' },
        { name: 'description',              type: 'string', isOptional: true },
        { name: 'note_interne',             type: 'string', isOptional: true },
        { name: 'date_livraison_prevue',    type: 'string', isOptional: true },
        { name: 'date_livraison_effective', type: 'string', isOptional: true },
        { name: 'urgence',                  type: 'boolean' },
        { name: 'is_archived',              type: 'boolean' },
        { name: 'rappel_j2_envoye',         type: 'boolean' },
        { name: 'photo_tissu_url',          type: 'string', isOptional: true },
        { name: 'atelier_id',               type: 'string' },
        { name: 'synced_at',                type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'mesures',
      columns: [
        { name: 'client_id',   type: 'string' },
        { name: 'vetement_id', type: 'string', isOptional: true },
        { name: 'champs_json', type: 'string' },
        { name: 'is_archived', type: 'boolean' },
        { name: 'atelier_id',  type: 'string' },
        { name: 'synced_at',   type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'vetements',
      columns: [
        { name: 'nom',                  type: 'string' },
        { name: 'categorie',            type: 'string', isOptional: true },
        { name: 'description',          type: 'string', isOptional: true },
        { name: 'libelles_mesures_json',type: 'string', isOptional: true },
        { name: 'images_json',          type: 'string', isOptional: true },
        { name: 'image_url',            type: 'string', isOptional: true },
        { name: 'est_gabarit',          type: 'boolean' },
        { name: 'is_systeme',           type: 'boolean' },
        { name: 'is_archived',          type: 'boolean' },
        { name: 'template_numero',      type: 'number', isOptional: true },
        { name: 'atelier_id',           type: 'string' },
        { name: 'synced_at',            type: 'number', isOptional: true },
      ],
    }),
    // ── v2 : tables ajoutées pour le full-offline ──────────────────────────
    tableSchema({
      name: 'collections',
      columns: [
        { name: 'nom',        type: 'string' },
        { name: 'atelier_id', type: 'string' },
        { name: 'synced_at',  type: 'number', isOptional: true },
      ],
    }),
    // REL-3 — cache hors ligne de « Mes Réalisations ». Lecture seule : envoyer
    // des photos hors ligne est un autre chantier (fichiers à mettre en file).
    // Ce cache sert à CONSULTER ses brouillons et ses dossiers en attente sans
    // réseau, ce qui est le cas d'usage réel en atelier.
    tableSchema({
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
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'titre',         type: 'string' },
        { name: 'contenu',       type: 'string', isOptional: true },
        { name: 'type',          type: 'string', isOptional: true },
        { name: 'lien',          type: 'string', isOptional: true },
        { name: 'is_read',       type: 'boolean' },
        { name: 'atelier_id',    type: 'string', isOptional: true },
        { name: 'date_creation', type: 'string', isOptional: true },
        { name: 'synced_at',     type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'paiements',
      columns: [
        { name: 'commande_id',   type: 'string' },
        { name: 'atelier_id',    type: 'string' },
        { name: 'montant',       type: 'number' },
        { name: 'mode_paiement', type: 'string', isOptional: true },
        { name: 'enregistre_par',type: 'string', isOptional: true },
        { name: 'date_paiement', type: 'string', isOptional: true },
        { name: 'synced_at',     type: 'number', isOptional: true },
      ],
    }),
    // ── v3 : items & échéances de commande (scopés via commande côté serveur) ──
    tableSchema({
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
    tableSchema({
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
})
