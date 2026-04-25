import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AdminLayout } from '@/components/admin'
import { notifAdminService } from '@/services/admin/notifAdminService'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'

const TYPES = [
  { value: 'info',                label: 'Info' },
  { value: 'promo',               label: 'Promotion' },
  { value: 'mise_a_jour',         label: 'Mise à jour' },
  { value: 'alerte_sync',         label: 'Alerte sync' },
  { value: 'alerte_abonnement',   label: 'Alerte abonnement' },
]

export default function AdminNotificationsPage() {
  const { data: ateliers } = useAdminAteliers()
  const [form, setForm] = useState({ titre: '', contenu: '', type: 'info', atelier_id: '' })
  const [success, setSuccess] = useState('')

  const send = useMutation({
    mutationFn: () => notifAdminService.broadcast({
      titre:      form.titre,
      contenu:    form.contenu,
      type:       form.type,
      atelier_id: form.atelier_id || undefined,
    }),
    onSuccess: (data) => {
      setSuccess(data.message ?? 'Notification envoyée.')
      setForm({ titre: '', contenu: '', type: 'info', atelier_id: '' })
    },
  })

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const ateliersList = ateliers?.data ?? ateliers ?? []

  const handleSubmit = e => { e.preventDefault(); setSuccess(''); send.mutate() }

  return (
    <AdminLayout title="Envoyer une notification">
      <div className="max-w-lg">
        <p className="text-sm text-gray-500 mb-6">
          Laissez «Atelier» vide pour un broadcast à tous les ateliers actifs.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Atelier cible (optionnel)</label>
            <select value={form.atelier_id} onChange={set('atelier_id')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
              <option value="">Broadcast — tous les ateliers</option>
              {ateliersList.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Type</label>
            <select value={form.type} onChange={set('type')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Titre</label>
            <input value={form.titre} onChange={set('titre')} required maxLength={150}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Contenu</label>
            <textarea value={form.contenu} onChange={set('contenu')} required rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-indigo-400 resize-none" />
          </div>

          {send.isError && (
            <p className="text-sm text-red-500">{send.error?.message ?? 'Erreur lors de l\'envoi.'}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}

          <button type="submit" disabled={send.isPending}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
            {send.isPending ? 'Envoi…' : form.atelier_id ? 'Envoyer à cet atelier' : 'Broadcaster à tous'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
