import { useState } from 'react'
import { HelpCircle, Plus } from 'lucide-react'
import { useTickets, useCreerTicket } from '@/hooks/useTicket'
import { AppLayout } from '@/components/layout'
import { Button, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

const CATEGORIES = [
  { value: 'technique',   label: 'Problème technique' },
  { value: 'facturation', label: 'Facturation'         },
  { value: 'compte',      label: 'Mon compte'          },
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
  const { data: tickets = [], isLoading } = useTickets()
  const creer = useCreerTicket()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ sujet: '', message: '', categorie: 'technique' })
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await creer.mutateAsync(form)
      setShowForm(false)
      setForm({ sujet: '', message: '', categorie: 'technique' })
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
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
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
              <div key={t.id} className="bg-card border border-edge rounded-xl px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink truncate flex-1">{t.sujet}</p>
                  <span className={`text-xs font-semibold shrink-0 ${STATUT_COLORS[t.statut] ?? 'text-dim'}`}>
                    {STATUT_LABELS[t.statut] ?? t.statut}
                  </span>
                </div>
                <p className="text-xs text-ghost mt-0.5">
                  {CATEGORIES.find(c => c.value === t.categorie)?.label ?? t.categorie}
                  {' · '}
                  {formatDate(t.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
