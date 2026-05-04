import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Image, X, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTicket, useRepondreTicket } from '@/hooks/useTicket'
import { AppLayout } from '@/components/layout'
import { Button, Skeleton } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

const STATUT_COLORS = {
  ouvert:   'bg-warning/10 text-warning',
  en_cours: 'bg-primary/10 text-primary',
  ferme:    'bg-success/10 text-success',
}

export default function SupportTicketDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { data: ticket, isLoading } = useTicket(id)
  const repondre = useRepondreTicket(id)

  const [message, setMessage]   = useState('')
  const [photo, setPhoto]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [error, setError]       = useState('')
  const fileRef = useRef()

  const STATUT_LABELS = {
    ouvert:   t('support.statuts.ouvert'),
    en_cours: t('support.statuts.en_cours'),
    ferme:    t('support.statuts.ferme'),
  }

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

  const handleSend = async e => {
    e.preventDefault()
    if (!message.trim()) return
    setError('')
    try {
      const payload = new FormData()
      payload.append('message', message)
      if (photo) payload.append('photo', photo)
      await repondre.mutateAsync(payload)
      setMessage('')
      removePhoto()
    } catch (err) {
      setError(err?.message || t('ticket_detail.erreur_envoi'))
    }
  }

  if (isLoading) {
    return (
      <AppLayout showBack title={t('support.titre')}>
        <div className="p-4 space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!ticket) {
    return (
      <AppLayout showBack title={t('support.titre')}>
        <p className="p-4 text-sm text-danger">{t('ticket_detail.introuvable')}</p>
      </AppLayout>
    )
  }

  const isFerme = ticket.statut === 'ferme'

  return (
    <AppLayout showBack title={`#${ticket.reference}`}>
      <div className="px-4 pt-4 pb-3 bg-card border-b border-edge">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-ink flex-1">{ticket.sujet}</p>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUT_COLORS[ticket.statut] ?? 'bg-subtle text-dim'}`}>
            {STATUT_LABELS[ticket.statut] ?? ticket.statut}
          </span>
        </div>
        <p className="text-xs text-ghost mt-1">{formatDate(ticket.created_at)}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(ticket.messages ?? []).length === 0 && (
          <p className="text-sm text-ghost text-center py-8">{t('ticket_detail.aucun_message')}</p>
        )}
        {(ticket.messages ?? []).map(msg => {
          const isAdmin = msg.expediteur_type === 'admin'
          return (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                isAdmin
                  ? 'bg-primary/10 border border-primary/20 ml-auto'
                  : 'bg-card border border-edge mr-auto'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-xs font-semibold text-dim">
                  {isAdmin ? t('ticket_detail.support_label') : t('ticket_detail.vous')}
                </span>
                <span className="text-xs text-ghost">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-sm text-ink whitespace-pre-wrap">{msg.contenu}</p>
              {msg.pj_url && (
                <img
                  src={msg.pj_url}
                  alt="capture"
                  className="mt-2 rounded-xl max-h-48 object-cover w-full"
                />
              )}
            </div>
          )
        })}
      </div>

      {!isFerme && (
        <div className="border-t border-edge p-4 space-y-3 bg-page">
          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-edge">
              <img src={preview} alt="capture" className="w-full max-h-32 object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}
          {error && <p className="text-xs text-danger">{error}</p>}
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 rounded-xl bg-card border border-edge flex items-center justify-center text-dim hover:text-primary hover:border-primary shrink-0 transition-colors"
            >
              <Image size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
            <textarea
              rows={2}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('ticket_detail.message_placeholder')}
              className="flex-1 border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:border-primary resize-none"
            />
            <Button
              type="submit"
              loading={repondre.isPending}
              disabled={!message.trim()}
              className="w-10 h-10 p-0 shrink-0"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}

      {isFerme && (
        <div className="p-4 text-center">
          <p className="text-sm text-dim bg-subtle rounded-xl px-3 py-3">
            {t('ticket_detail.ferme_message')}
          </p>
        </div>
      )}
    </AppLayout>
  )
}
