import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Plus, Image, X, ChevronRight } from 'lucide-react'
import { useTickets, useCreerTicket } from '@/hooks/useTicket'
import { toSupportTicket } from '@/constants/routes'
import { AppLayout } from '@/components/layout'
import { Button, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

const CATEGORIES = [
  { value: 'technique',   label: 'Problème technique' },
  { value: 'facturation', label: 'Facturation'         },
  { value: 'compte',      label: 'Mon compte'          },
  { value: 'abonnement',  label: 'Abonnement'          },
  { value: 'autre',       label: 'Autre'               },
]

const STATUT_COLORS = {
  ouvert:   'text-warning',
  en_cours: 'text-primary',
  ferme:    'text-success',
}
const STATUT_LABELS = {
  ouvert:   'Ouvert',
  en_cours: 'En cours',
  ferme:    'Fermé',
}

export default function SupportPage() {
  const navigate = useNavigate()
  const { data: tickets = [], isLoading } = useTickets()
  const creer = useCreerTicket()
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
    <AppLayout showBack title="Support">
      <div className="p-4 space-y-4">
        <Button icon={Plus} className="w-full" onClick={() => setShowForm(s => !s)}>
          Nouveau ticket
        </Button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-edge rounded-2xl p-4 space-y-4">
            <p className="text-sm font-semibold text-ink">Décrire votre problème</p>
            <Select
              label="Catégorie"
              value={form.categorie}
              onChange={set('categorie')}
              options={CATEGORIES}
            />
            <Input
              label="Sujet"
              value={form.sujet}
              onChange={set('sujet')}
              placeholder="Ex : Impossible de créer une commande"
              required
            />
            <div>
              <label className="block text-xs font-medium text-dim mb-1">Message</label>
              <textarea
                className="w-full border border-edge rounded-xl p-3 text-sm text-ink bg-transparent resize-none focus:outline-none focus:border-primary min-h-28"
                placeholder="Décrivez le problème en détail…"
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
                Annuler
              </Button>
              <Button type="submit" loading={creer.isPending} className="flex-1">
                Envoyer
              </Button>
            </div>
          </form>
        )}

        <p className="text-xs font-semibold text-dim uppercase tracking-wide">Mes demandes</p>

        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl mb-2" />)
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="Aucun ticket"
            description="Vos demandes de support apparaîtront ici"
          />
        ) : (
          <div className="space-y-2">
            {tickets.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(toSupportTicket(t.id))}
                className="w-full bg-card border border-edge rounded-xl px-4 py-3 text-left hover:bg-subtle transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink truncate flex-1">{t.sujet}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs font-semibold ${STATUT_COLORS[t.statut] ?? 'text-dim'}`}>
                      {STATUT_LABELS[t.statut] ?? t.statut}
                    </span>
                    <ChevronRight size={14} className="text-ghost" />
                  </div>
                </div>
                <p className="text-xs text-ghost mt-0.5">
                  {CATEGORIES.find(c => c.value === t.categorie)?.label ?? t.categorie}
                  {' · '}
                  {formatDate(t.created_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
