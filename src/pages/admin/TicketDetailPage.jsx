import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Image, X } from 'lucide-react'
import { AdminLayout, AdminBadge } from '@/components/admin'
import { useAdminTicket, useRepondreTicket, useFermerTicket, useRouvrirTicket } from '@/hooks/admin/useTickets'
import { formatDate } from '@/utils/formatDate'

export default function TicketDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: ticket, isLoading } = useAdminTicket(id)
  const repondre = useRepondreTicket(id)
  const fermer   = useFermerTicket()
  const rouvrir  = useRouvrirTicket()

  const [contenu, setContenu]     = useState('')
  const [isInterne, setIsInterne] = useState(false)
  const [photo, setPhoto]         = useState(null)
  const [preview, setPreview]     = useState(null)
  const fileRef = useRef()

  const handlePhoto = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhoto(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleRepondre = async e => {
    e.preventDefault()
    if (!contenu.trim()) return
    const payload = new FormData()
    payload.append('contenu', contenu)
    payload.append('is_note_interne', isInterne ? '1' : '0')
    if (photo) payload.append('photo', photo)
    await repondre.mutateAsync(payload)
    setContenu('')
    setIsInterne(false)
    removePhoto()
  }

  if (isLoading) return <AdminLayout title="Ticket"><p className="text-sm text-ghost">{t('admin.commun.chargement')}</p></AdminLayout>
  if (!ticket)   return <AdminLayout title="Ticket"><p className="text-sm text-danger">{t('admin.ticket_detail.introuvable')}</p></AdminLayout>

  return (
    <AdminLayout title={`Ticket ${ticket.reference}`}>
      <div className="grid grid-cols-3 gap-6">
        {/* Conversation */}
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-edge rounded-xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold text-ink">{ticket.sujet}</h2>
                <p className="text-xs text-ghost mt-0.5">
                  {ticket.atelier?.nom} — {formatDate(ticket.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AdminBadge value={ticket.statut} />
                {ticket.statut !== 'ferme' ? (
                  <button onClick={() => fermer.mutate(id)} className="text-xs text-danger hover:text-danger/70 transition-colors">
                    {t('admin.ticket_detail.fermer')}
                  </button>
                ) : (
                  <button onClick={() => rouvrir.mutate(id)} className="text-xs text-success hover:text-success/70 transition-colors">
                    {t('admin.ticket_detail.rouvrir')}
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
                      ? 'bg-primary/5 ml-8'
                      : 'bg-subtle mr-8'
                  } ${msg.is_note_interne ? 'border border-warning/40' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-dim">
                      {msg.expediteur_type === 'admin'
                        ? t('admin.ticket_detail.expediteur_admin')
                        : t('admin.ticket_detail.expediteur_client')}
                      {msg.is_note_interne && ` ${t('admin.ticket_detail.note_interne_badge')}`}
                    </span>
                    <span className="text-xs text-ghost">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-ink whitespace-pre-wrap">{msg.contenu}</p>
                  {msg.pj_url && (
                    <img src={msg.pj_url} alt="capture" className="mt-2 rounded-xl max-h-48 object-cover w-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Répondre */}
            {ticket.statut !== 'ferme' && (
              <form onSubmit={handleRepondre} className="mt-4 space-y-3">
                <textarea
                  value={contenu}
                  onChange={e => setContenu(e.target.value)}
                  placeholder={t('admin.ticket_detail.votre_reponse')}
                  rows={4}
                  className="w-full border border-edge rounded-xl px-4 py-3 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />

                {preview ? (
                  <div className="relative rounded-xl overflow-hidden border border-edge">
                    <img src={preview} alt="capture" className="w-full max-h-32 object-cover" />
                    <button type="button" onClick={removePhoto}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                      <X size={12} className="text-inverse" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 text-xs text-ghost hover:text-primary transition-colors">
                    <Image size={14} />
                    {t('admin.ticket_detail.joindre_capture')}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-xs text-ghost cursor-pointer">
                    <input type="checkbox" checked={isInterne} onChange={e => setIsInterne(e.target.checked)} className="accent-primary" />
                    {t('admin.ticket_detail.note_interne_label')}
                  </label>
                  <button type="submit" disabled={repondre.isPending || !contenu.trim()}
                    className="bg-primary text-inverse text-sm px-4 py-2 rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
                    {repondre.isPending ? t('admin.ticket_detail.envoi') : t('admin.ticket_detail.envoyer')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Infos latérales */}
        <div className="space-y-4">
          <div className="bg-card border border-edge rounded-xl p-5 text-sm">
            <h3 className="text-2xs font-semibold text-ghost uppercase tracking-widest mb-3">
              {t('admin.ticket_detail.informations')}
            </h3>
            <div className="flex justify-between py-2 border-b border-edge">
              <span className="text-ghost">{t('admin.ticket_detail.priorite')}</span>
              <span className="font-medium text-ink">{ticket.priorite}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-edge">
              <span className="text-ghost">{t('admin.ticket_detail.assigne')}</span>
              <span className="font-medium text-ink">
                {ticket.assignedTo ? `${ticket.assignedTo.prenom} ${ticket.assignedTo.nom}` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-edge last:border-0">
              <span className="text-ghost">{t('admin.ticket_detail.atelier')}</span>
              <span className="font-medium text-ink">{ticket.atelier?.nom ?? '—'}</span>
            </div>
            {ticket.resolu_at && (
              <div className="flex justify-between py-2">
                <span className="text-ghost">{t('admin.ticket_detail.resolu_le')}</span>
                <span className="font-medium text-ink">{formatDate(ticket.resolu_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
