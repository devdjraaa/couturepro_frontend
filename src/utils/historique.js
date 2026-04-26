const KEY   = 'cp_historique'
const MAX   = 200
const DAYS  = 8

export function logAction(type, label, meta = {}) {
  try {
    const list = getHistorique()
    const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000
    const pruned = list.filter(e => new Date(e.at).getTime() > cutoff)
    pruned.unshift({ id: crypto.randomUUID(), type, label, meta, at: new Date().toISOString() })
    localStorage.setItem(KEY, JSON.stringify(pruned.slice(0, MAX)))
  } catch { /* ignore quota errors */ }
}

export function getHistorique() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function clearHistorique() {
  localStorage.removeItem(KEY)
}
