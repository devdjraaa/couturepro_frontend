import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Image, X, ChevronRight, FlaskConical, CheckCircle2, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useTickets, useCreerTicket } from '@/hooks/useTicket'
import { useSeedDemo } from '@/hooks/useSeedDemo'
import { toSupportTicket } from '@/constants/routes'
import { AppLayout } from '@/components/layout'
import { Button, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { compressImage } from '@/utils/compressImage'
import { cn } from '@/utils/cn'

const STATUT_COLORS = {
  ouvert:   'text-warning',
  en_cours: 'text-primary',
  ferme:    'text-success',
}

export default function SupportPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: tickets = [], isLoading } = useTickets()
  const creer = useCreerTicket()
  const demo = useSeedDemo()

  const CATEGORIES = [
    { value: 'technique',   label: t('support.categories.technique')  },
    { value: 'facturation', label: t('support.categories.facturation') },
    { value: 'compte',      label: t('support.categories.compte')      },
    { value: 'abonnement',  label: t('support.categories.abonnement')  },
    { value: 'autre',       label: t('support.categories.autre')       },
  ]

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ sujet: '', message: '', categorie: 'technique' })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

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

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const payload = new FormData()
      payload.append('sujet',     form.sujet)
      payload.append('message',   form.message)
      payload.append('categorie', form.categorie)
      // P36 : compresser la photo avant l'upload (~1600px, < 1 Mo) → upload rapide, moins de timeouts.
      if (photo) payload.append('photo', await compressImage(photo))

      await creer.mutateAsync(payload)
      setShowForm(false)
      setForm({ sujet: '', message: '', categorie: 'technique' })
      removePhoto()
    } catch (err) {
      setError(err?.message || 'Erreur lors de la création du ticket')
    }
  }

  return (
    <AppLayout showBack title={t('support.titre')} onRefresh={() => queryClient.invalidateQueries()}>
      <div className="p-4 space-y-4">
        {/* SUP-1 : encart PERMANENT. Le seul texte expliquant à quoi sert un
            ticket vivait dans l'état vide — il disparaissait donc dès le premier
            ticket créé, c'est-à-dire pour tous ceux qui utilisent réellement le
            support. */}
        <div className="rounded-2xl border border-edge bg-subtle p-4 flex items-start gap-3">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Info size={18} />
          </span>
          <p className="text-sm text-dim leading-relaxed">{t('support.encart')}</p>
        </div>

        <Button icon={Plus} className="w-full" onClick={() => setShowForm(s => !s)}>
          {t('support.nouveau_ticket')}
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-edge rounded-2xl p-4 space-y-4">
            <p className="text-sm font-semibold text-ink">{t('support.formulaire.titre')}</p>
            <Select
              label={t('support.formulaire.categorie')}
              value={form.categorie}
              onChange={set('categorie')}
              options={CATEGORIES}
            />
            {/* #27-29 — Sujet avec compteur dynamique */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-dim">{t('support.formulaire.sujet')}</label>
                <span className={cn('text-xs tabular-nums', form.sujet.length > 240 ? 'text-error font-semibold' : 'text-ghost')}>
                  {form.sujet.length}/255
                </span>
              </div>
              <input
                type="text"
                value={form.sujet}
                onChange={set('sujet')}
                placeholder={t('support.formulaire.sujet_placeholder')}
                maxLength={255}
                required
                className="w-full border border-edge rounded-xl px-3 py-2.5 text-sm text-ink bg-transparent focus:outline-none focus:border-primary"
              />
            </div>

            {/* #30-32 — Message avec compteur + blocage à 5000 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-dim">{t('support.formulaire.message')}</label>
                <span className={cn('text-xs tabular-nums', form.message.length > 4800 ? 'text-error font-semibold' : 'text-ghost')}>
                  {form.message.length}/5000
                </span>
              </div>
              <textarea
                className="w-full border border-edge rounded-xl p-3 text-sm text-ink bg-transparent resize-none focus:outline-none focus:border-primary min-h-28"
                placeholder={t('support.formulaire.message_placeholder')}
                value={form.message}
                maxLength={5000}
                onChange={e => {
                  if (e.target.value.length <= 5000) set('message')(e)
                }}
                required
              />
              {form.message.length >= 5000 && (
                <p className="text-xs text-error mt-1">Limite de 5 000 caractères atteinte.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-2">{t('support.formulaire.photo')}</label>
              {preview ? (
                <div className="relative w-full rounded-xl overflow-hidden border border-edge">
                  <img src={preview} alt="capture" className="w-full max-h-40 object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-dashed border-edge rounded-xl p-4 flex flex-col items-center gap-2 text-dim hover:border-primary hover:text-primary transition-colors"
                >
                  <Image size={20} />
                  <span className="text-xs">{t('support.formulaire.photo_ajouter')}</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => { setShowForm(false); removePhoto() }}>
                {t('commun.annuler')}
              </Button>
              <Button type="submit" loading={creer.isPending} className="flex-1">
                {t('support.formulaire.envoyer')}
              </Button>
            </div>
          </form>
        )}

        {/* Mode démo — visible uniquement en mode démo (atelier.is_demo = true) */}
        {demo.available && (
          <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={15} className="text-primary shrink-0" />
              <p className="text-sm font-semibold text-ink">{t('support.demo.titre')}</p>
            </div>
            <p className="text-xs text-ghost leading-relaxed">
              {t('support.demo.description')}
            </p>
            {demo.done ? (
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 size={15} />
                {t('support.demo.success')}
              </div>
            ) : (
              <Button
                variant="secondary"
                icon={FlaskConical}
                loading={demo.loading}
                onClick={demo.seed}
                className="w-full"
              >
                {t('support.demo.btn')}
              </Button>
            )}
          </div>
        )}

        <p className="text-xs font-semibold text-dim uppercase tracking-wide">{t('support.liste.titre')}</p>

        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl mb-2" />)
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title={t('support.liste.vide')}
            description={t('support.liste.vide_description')}
          />
        ) : (
          <div className="space-y-2">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => navigate(toSupportTicket(ticket.id))}
                className="w-full bg-card border border-edge rounded-xl px-4 py-3 text-left hover:bg-subtle transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink truncate flex-1">{ticket.sujet}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-semibold ${STATUT_COLORS[ticket.statut] ?? 'text-dim'}`}>
                      {t(`support.statuts.${ticket.statut}`, { defaultValue: ticket.statut })}
                    </span>
                    <ChevronRight size={14} className="text-ghost" />
                  </div>
                </div>
                <p className="text-xs text-ghost mt-0.5">
                  {CATEGORIES.find(c => c.value === ticket.categorie)?.label ?? ticket.categorie}
                  {' · '}
                  {formatDate(ticket.created_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
