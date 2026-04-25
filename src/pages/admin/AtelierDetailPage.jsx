import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminLayout, AdminBadge } from '@/components/admin'
import { useAdminAtelier, useGelerAtelier, useDegelerAtelier, useAdminAtelierFidelite, useAjusterFidelite } from '@/hooks/admin/useAteliers'
import { formatDate } from '@/utils/formatDate'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? '—'}</span>
    </div>
  )
}

export default function AtelierDetailPage() {
  const { id } = useParams()
  const { data: atelier, isLoading } = useAdminAtelier(id)
  const { data: fidelite }           = useAdminAtelierFidelite(id)
  const geler    = useGelerAtelier()
  const degeler  = useDegelerAtelier()
  const ajuster  = useAjusterFidelite(id)

  const [ajustForm, setAjustForm] = useState({ points: '', description: '' })
  const [showAjust, setShowAjust] = useState(false)

  const handleAjuster = async e => {
    e.preventDefault()
    await ajuster.mutateAsync({ points: Number(ajustForm.points), description: ajustForm.description })
    setAjustForm({ points: '', description: '' })
    setShowAjust(false)
  }

  if (isLoading) return <AdminLayout title="Atelier"><p className="text-sm text-gray-400">Chargement…</p></AdminLayout>
  if (!atelier)  return <AdminLayout title="Atelier"><p className="text-sm text-red-500">Atelier introuvable.</p></AdminLayout>

  return (
    <AdminLayout title={atelier.nom}>
      <div className="grid grid-cols-3 gap-6">

        {/* Infos générales */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-700 text-sm">Informations</h2>
              <div className="flex gap-2">
                <AdminBadge value={atelier.statut} />
                {atelier.statut === 'gele' ? (
                  <button onClick={() => degeler.mutate(id)} className="text-xs text-green-600 hover:underline">
                    Dégeler
                  </button>
                ) : (
                  <button onClick={() => geler.mutate(id)} className="text-xs text-red-500 hover:underline">
                    Geler
                  </button>
                )}
              </div>
            </div>
            <InfoRow label="Propriétaire"  value={atelier.proprietaire ? `${atelier.proprietaire.prenom} ${atelier.proprietaire.nom}` : null} />
            <InfoRow label="Téléphone"     value={atelier.proprietaire?.telephone} />
            <InfoRow label="Créé le"       value={formatDate(atelier.created_at)} />
            <InfoRow label="Clients"       value={atelier.clients_count} />
            <InfoRow label="Commandes"     value={atelier.commandes_count} />
          </div>

          {/* Abonnement */}
          {atelier.abonnement && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-700 text-sm mb-4">Abonnement</h2>
              <InfoRow label="Plan"        value={atelier.abonnement.niveau?.label ?? atelier.abonnement.niveau_cle} />
              <InfoRow label="Statut"      value={<AdminBadge value={atelier.abonnement.statut} />} />
              <InfoRow label="Début"       value={formatDate(atelier.abonnement.debut_at)} />
              <InfoRow label="Fin"         value={formatDate(atelier.abonnement.fin_at)} />
            </div>
          )}

          {/* Équipe */}
          {atelier.equipesMembres?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-700 text-sm mb-4">Équipe ({atelier.equipesMembres.length})</h2>
              <div className="space-y-1">
                {atelier.equipesMembres.map(m => (
                  <div key={m.id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{m.prenom} {m.nom}</span>
                    <span className="text-gray-400">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fidélité */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-700 text-sm mb-4">Points fidélité</h2>
            <p className="text-3xl font-bold text-indigo-600">{fidelite?.solde_pts ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">points</p>
            <button
              onClick={() => setShowAjust(v => !v)}
              className="mt-4 text-xs text-indigo-600 hover:underline"
            >
              {showAjust ? 'Annuler' : 'Ajuster les points'}
            </button>

            {showAjust && (
              <form onSubmit={handleAjuster} className="mt-3 space-y-2">
                <input
                  type="number"
                  value={ajustForm.points}
                  onChange={e => setAjustForm(f => ({ ...f, points: e.target.value }))}
                  placeholder="Ex: 50 ou -20"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
                <input
                  value={ajustForm.description}
                  onChange={e => setAjustForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Motif"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={ajuster.isPending}
                  className="w-full bg-indigo-600 text-white text-sm py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {ajuster.isPending ? 'Enregistrement…' : 'Appliquer'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
