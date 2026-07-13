import { useMemo } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useWmQuery, useMutation, database } from '@/db/useWmQuery'
import api from '@/services/api'

// Offline-first : notifications lues/marquées dans WatermelonDB (sync serveur).

function toPlain(n) {
  return {
    id:         n.id,
    titre:      n.titre,
    contenu:    n.contenu,
    type:       n.type,
    lien:       n.lien ?? null,
    is_read:    n.is_read,
    created_at: n.date_creation ?? n._raw.created_at ?? null,
  }
}

export function useNotifications() {
  const { data: records, isLoading } = useWmQuery(
    () => database.get('notifications').query(),
    [],
  )
  const data = useMemo(() => {
    return records
      .map(toPlain)
      .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))
  }, [records])
  return { data, isLoading }
}

export function useNotificationsCount() {
  const { data: records } = useWmQuery(
    () => database.get('notifications').query(Q.where('is_read', false)),
    [],
  )
  return { data: records.length }
}

export function useMarquerLue() {
  return useMutation(async (id) => {
    // 1) Local (WatermelonDB) → l'UI réagit tout de suite.
    try {
      await database.write(async () => {
        const record = await database.get('notifications').find(id)
        await record.update(n => { n.is_read = true })
      })
    } catch { /* record absent en local : on marque quand même côté serveur */ }
    // 2) Serveur (autorité) → le prochain pull ne re-marquera plus non-lu.
    try { await api.post('/notifications/mark-as-read', { ids: [id] }) } catch { /* offline : la sync poussera */ }
  })
}

export function useMarquerToutesLues() {
  return useMutation(async () => {
    // 1) Local
    try {
      await database.write(async () => {
        const unread = await database.get('notifications').query(Q.where('is_read', false)).fetch()
        await database.batch(...unread.map(n => n.prepareUpdate(r => { r.is_read = true })))
      })
    } catch { /* rien à marquer en local */ }
    // 2) Serveur
    try { await api.post('/notifications/mark-as-read', { all: true }) } catch { /* offline */ }
  })
}
