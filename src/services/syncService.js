import api from './api'

const QUEUE_KEY     = 'cp_sync_queue'
const LAST_PULL_KEY = 'cp_sync_last_pull'

// ─── Queue helpers ────────────────────────────────────────────────────────────

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') } catch { return [] }
}

function writeQueue(ops) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ops))
}

let _idCounter = 0
function uid() {
  return `sync_${Date.now()}_${++_idCounter}`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ajoute une opération en queue pour envoi ultérieur.
 *
 * @param {'clients'|'commandes'|'mesures'|'vetements'} table
 * @param {'create'|'update'|'delete'} operation
 * @param {string} recordId  — ID de l'enregistrement (temp pour create, réel pour update/delete)
 * @param {object} data      — Corps de l'opération (null pour delete)
 */
export function enqueue(table, operation, recordId, data = null) {
  const ops = readQueue()
  ops.push({
    _qid: uid(),           // identifiant interne de l'opération queue
    table,
    operation,
    id: recordId,
    data,
    created_at: new Date().toISOString(),
    retries: 0,
  })
  writeQueue(ops)
}

/** Nombre d'opérations en attente. */
export function getPendingCount() {
  return readQueue().length
}

/** Vide la queue (après flush réussi). */
export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY)
}

/**
 * Envoie toutes les opérations en queue au serveur (max 20 par batch).
 * Ne retire de la queue que les ops dont le serveur accuse réception.
 * @returns {{ synced: number, failed: number }}
 */
export async function flush() {
  const ops = readQueue()
  if (ops.length === 0) return { synced: 0, failed: 0 }

  const BATCH = 20
  let synced = 0
  let failed = 0
  const remaining = []

  for (let i = 0; i < ops.length; i += BATCH) {
    const batch = ops.slice(i, i + BATCH)

    try {
      const { data } = await api.post('/sync/push', {
        operations: batch.map(op => ({
          table:     op.table,
          operation: op.operation,
          id:        op.id,
          data:      op.data,
        })),
      })

      // Le backend retourne { results: [{ id, status, message }] }
      // On retire les ops dont le status n'est pas 'error'
      const resultMap = {}
      ;(data.results ?? []).forEach(r => { resultMap[r.id] = r.status })

      batch.forEach(op => {
        const status = resultMap[op.id]
        if (status && status !== 'error') {
          synced++
        } else {
          op.retries = (op.retries ?? 0) + 1
          if (op.retries < 5) remaining.push(op)
          else failed++
        }
      })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401 || status === 403) {
        // Invalide, on abandonne le batch
        failed += batch.length
      } else {
        // Erreur réseau — on remet en queue avec retry++
        batch.forEach(op => {
          op.retries = (op.retries ?? 0) + 1
          if (op.retries < 5) remaining.push(op)
          else failed++
        })
      }
    }
  }

  writeQueue(remaining)
  return { synced, failed }
}

/**
 * Tire les données fraîches depuis le serveur.
 * Utilise `last_pulled_at` (param backend) pour récupérer uniquement le delta.
 * @returns {object|null}
 */
export async function pull() {
  const lastPulledAt = localStorage.getItem(LAST_PULL_KEY)
  try {
    const params = lastPulledAt ? { last_pulled_at: lastPulledAt } : {}
    const { data } = await api.get('/sync/pull', { params })
    // Persiste le timestamp retourné par le serveur
    if (data.last_pulled_at) {
      localStorage.setItem(LAST_PULL_KEY, data.last_pulled_at)
    }
    return data
  } catch {
    return null
  }
}

/** Timestamp ISO du dernier pull réussi. */
export function getLastPullAt() {
  return localStorage.getItem(LAST_PULL_KEY)
}
