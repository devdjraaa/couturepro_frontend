import { synchronize } from '@nozbe/watermelondb/sync'
import api from '@/services/api'
import database from './database'

const TABLES = ['clients', 'commandes', 'mesures', 'vetements']

/**
 * Convertit la réponse pull du backend (format maison) vers le format WatermelonDB.
 *
 * Backend retourne :
 *   { last_pulled_at: "ISO", data: { clients: [...records avec _deleted], ... } }
 *
 * WatermelonDB attend :
 *   { changes: { clients: { created:[], updated:[], deleted:[] } }, timestamp: number }
 */
function adaptPullResponse(backendData) {
  const changes = {}

  for (const table of TABLES) {
    const records = backendData.data?.[table] ?? []
    const updated = []
    const deleted = []

    for (const record of records) {
      const { _deleted, ...rest } = record
      const row = normalizeRecord(table, rest)
      if (_deleted) {
        deleted.push(row.id)
      } else {
        updated.push(row)
      }
    }

    changes[table] = { created: [], updated, deleted }
  }

  return {
    changes,
    timestamp: new Date(backendData.last_pulled_at).getTime(),
  }
}

/**
 * Normalise un record backend pour qu'il soit compatible avec le schéma WatermelonDB.
 * Les champs JSON (arrays/objects) sont sérialisés en string.
 */
function normalizeRecord(table, record) {
  const out = { ...record }

  if (table === 'mesures') {
    if (out.champs !== undefined) {
      out.champs_json = typeof out.champs === 'string' ? out.champs : JSON.stringify(out.champs)
      delete out.champs
    }
  }

  if (table === 'vetements') {
    if (out.images !== undefined) {
      out.images_json = typeof out.images === 'string' ? out.images : JSON.stringify(out.images ?? [])
      delete out.images
    }
    if (out.libelles_mesures !== undefined) {
      out.libelles_mesures_json = typeof out.libelles_mesures === 'string'
        ? out.libelles_mesures
        : JSON.stringify(out.libelles_mesures ?? [])
      delete out.libelles_mesures
    }
    // Garder image_url, supprimer images_urls (calculé backend)
    delete out.images_urls
    // Mappe is_systeme → est_gabarit si nécessaire
    if (out.est_gabarit === undefined && out.is_systeme !== undefined) {
      out.est_gabarit = out.is_systeme
    }
  }

  // Supprimer les colonnes calculées backend qui ne sont pas dans le schéma
  delete out.atelier
  delete out.client
  delete out.vetement
  delete out.created_by_role
  delete out.archived_at
  delete out.archived_by
  delete out.archive_note
  delete out.deleted_at
  delete out.photo_tissu_path  // on garde photo_tissu_url

  // WatermelonDB stocke les booleans, pas les integers — forcer le type
  const boolFields = ['is_vip', 'is_archived', 'urgence', 'rappel_j2_envoye', 'est_gabarit', 'is_systeme']
  for (const f of boolFields) {
    if (out[f] !== undefined) out[f] = Boolean(out[f])
  }

  // Timestamps ISO → on garde en string pour les champs date
  // (WatermelonDB stocke dates livraison en string dans notre schéma)

  out.synced_at = Date.now()
  return out
}

/**
 * Convertit les changements WatermelonDB (format push) vers le format backend.
 *
 * WatermelonDB donne :
 *   { clients: { created: [...], updated: [...], deleted: ['id1'] }, ... }
 *
 * Backend attend :
 *   { operations: [{ table, operation, id, data }] }
 */
function adaptPushChanges(wmChanges) {
  const operations = []

  for (const table of TABLES) {
    const tableChanges = wmChanges[table]
    if (!tableChanges) continue

    for (const record of tableChanges.created ?? []) {
      operations.push({ table, operation: 'create', id: record.id, data: denormalizeRecord(table, record) })
    }
    for (const record of tableChanges.updated ?? []) {
      operations.push({ table, operation: 'update', id: record.id, data: denormalizeRecord(table, record) })
    }
    for (const id of tableChanges.deleted ?? []) {
      operations.push({ table, operation: 'delete', id, data: null })
    }
  }

  return { operations }
}

/**
 * Reconvertit un record WatermelonDB vers le format attendu par le backend.
 */
function denormalizeRecord(table, record) {
  const out = { ...record }

  // Supprimer les champs internes WatermelonDB
  delete out._status
  delete out._changed
  delete out.synced_at

  if (table === 'mesures' && out.champs_json !== undefined) {
    try { out.champs = JSON.parse(out.champs_json) } catch { out.champs = {} }
    delete out.champs_json
  }

  if (table === 'vetements') {
    if (out.images_json !== undefined) {
      try { out.images = JSON.parse(out.images_json) } catch { out.images = [] }
      delete out.images_json
    }
    if (out.libelles_mesures_json !== undefined) {
      try { out.libelles_mesures = JSON.parse(out.libelles_mesures_json) } catch { out.libelles_mesures = [] }
      delete out.libelles_mesures_json
    }
  }

  return out
}

const LAST_PULLED_KEY = 'cp_wm_last_pulled_at'

export async function syncWithServer() {
  await synchronize({
    database,

    pullChanges: async ({ lastPulledAt }) => {
      const lastPulledAtISO = lastPulledAt
        ? new Date(lastPulledAt).toISOString()
        : null

      const params = lastPulledAtISO ? { last_pulled_at: lastPulledAtISO } : {}
      const { data } = await api.get('/sync/pull', { params })

      // Persiste le timestamp pour la prochaine session
      localStorage.setItem(LAST_PULLED_KEY, String(new Date(data.last_pulled_at).getTime()))

      return adaptPullResponse(data)
    },

    pushChanges: async ({ changes }) => {
      const body = adaptPushChanges(changes)
      if (body.operations.length === 0) return
      await api.post('/sync/push', body)
    },

    migrationsEnabledAtVersion: 1,
  })
}

export function getLastPulledAt() {
  const raw = localStorage.getItem(LAST_PULLED_KEY)
  return raw ? parseInt(raw, 10) : null
}

export function clearSyncState() {
  localStorage.removeItem(LAST_PULLED_KEY)
}
