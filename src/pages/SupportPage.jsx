import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Image, X, ChevronRight, FlaskConical, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useTickets, useCreerTicket } from '@/hooks/useTicket'
import { useSeedDemo } from '@/hooks/useSeedDemo'
import { toSupportTicket } from '@/constants/routes'
import { AppLayout } from '@/components/layout'
import { Button, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

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
      if (photo) payload.append('photo', photo)

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
            <Input
              label={t('support.formulaire.sujet')}
              value={form.sujet}
              onChange={set('sujet')}
              placeholder={t('support.formulaire.sujet_placeholder')}
              required
            />
            <div>
              <label className="block text-xs font-medium text-dim mb-1">{t('support.formulaire.message')}</label>
              <textarea
                className="w-full border border-edge rounded-xl p-3 text-sm text-ink bg-transparent resize-none focus:outline-none focus:border-primary min-h-28"
                placeholder={t('support.formulaire.message_placeholder')}
                value={form.message}
                onChange={set('message')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dim mb-2">Photo (optionnel)</label>
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
                  <span className="text-xs">Ajouter une capture d'écran</span>
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
              <p className="text-sm font-semibold text-ink">Données de démonstration</p>
            </div>
            <p className="text-xs text-ghost leading-relaxed">
              Injecte 15 clients et 25 commandes d'exemple pour explorer l'application sans saisir de données réelles. Remplace les données actuelles.
            </p>
            {demo.done ? (
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 size={15} />
                Données injectées — explorez l'application !
              </div>
            ) : (
              <Button
                variant="secondary"
                icon={FlaskConical}
                loading={demo.loading}
                onClick={demo.seed}
                className="w-full"
              >
                Réinitialiser les données démo
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
