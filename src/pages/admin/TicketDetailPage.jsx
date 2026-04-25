import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdminLayout, AdminBadge } from '@/components/admin'
import { useAdminTicket, useRepondreTicket, useFermerTicket, useRouvrirTicket } from '@/hooks/admin/useTickets'
import { formatDate } from '@/utils/formatDate'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { data: ticket, isLoading } = useAdminTicket(id)
  const repondre = useRepondreTicket(id)
  const fermer   = useFermerTicket()
  const rouvrir  = useRouvrirTicket()

  const [contenu, setContenu]       = useState('')
  const [isInterne, setIsInterne]   = useState(false)

  const handleRepondre = async e => {
    e.preventDefault()
    if (!contenu.trim()) return
    await repondre.mutateAsync({ contenu, is_note_interne: isInterne })
    setContenu('')
  }

  if (isLoading) return <AdminLayout title="Ticket"><p className="text-sm text-gray-400">Chargement…</p></AdminLayout>
  if (!ticket)   return <AdminLayout title="Ticket"><p className="text-sm text-red-500">Ticket introuvable.</p></AdminLayout>

  return (
    <AdminLayout title={`Ticket ${ticket.reference}`}>
      <div className="grid grid-cols-3 gap-6">
        {/* Conversation */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">{ticket.sujet}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ticket.atelier?.nom} — {formatDate(ticket.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AdminBadge value={ticket.statut} />
                {ticket.statut !== 'ferme' ? (
                  <button onClick={() => fermer.mutate(id)} className="text-xs text-red-500 hover:underline">
                    Fermer
                  </button>
                ) : (
                  <button onClick={() => rouvrir.mutate(id)} className="text-xs text-green-600 hover:underline">
                    Rouvrir
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 mt-4">
              {(ticket.messages ?? []).map(msg => (
                <div
                  key={msg.id}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    msg.expediteur_type === 'admin'
                      ? 'bg-indigo-50 ml-8'
                      : 'bg-gray-50 mr-8'
                  } ${msg.is_note_interne ? 'border border-yellow-300' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-600">
                      {msg.expediteur_type === 'admin' ? 'Admin' : 'Client'}
                      {msg.is_note_interne && ' (note interne)'}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{msg.contenu}</p>
                </div>
              ))}
            </div>

            {/* Répondre */}
            {ticket.statut !== 'ferme' && (
              <form onSubmit={handleRepondre} className="mt-4 space-y-2">
                <textarea
                  value={contenu}
                  onChange={e => setContenu(e.target.value)}
                  placeholder="Votre réponse…"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none"
                />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={isInterne} onChange={e => setIsInterne(e.target.checked)} />
                    Note interne (non visible par le client)
                  </label>
                  <button
                    type="submit"
                    disabled={repondre.isPending || !contenu.trim()}
                    className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {repondre.isPending ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Infos latérales */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm space-y-2">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-3">Informations</h3>
            <div className="flex justify-between">
              <span className="text-gray-500">Priorité</span>
              <span className="font-medium">{ticket.priorite}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigné à</span>
              <span className="font-medium">
                {ticket.assignedTo ? `${ticket.assignedTo.prenom} ${ticket.assignedTo.nom}` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Atelier</span>
              <span className="font-medium">{ticket.atelier?.nom ?? '—'}</span>
            </div>
            {ticket.resolu_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Résolu le</span>
                <span className="font-medium">{formatDate(ticket.resolu_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
