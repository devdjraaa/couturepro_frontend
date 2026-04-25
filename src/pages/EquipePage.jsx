import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useEquipe, useInviterMembre, useRemoveMembre } from '@/hooks/useEquipe'
import { usePlanLimit } from '@/hooks/usePlanFeature'
import { useAuth } from '@/contexts'
import { AppLayout } from '@/components/layout'
import { MembreCard } from '@/components/equipe'
import { EmptyState, Skeleton, BottomSheet, Button, Input, Select } from '@/components/ui'
const ROLE_OPTIONS = [
  { value: 'assistant', label: 'Assistant' },
  { value: 'membre',    label: 'Membre'    },
]

export default function EquipePage() {
  const { can } = useAuth()
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', role: 'assistant' })
  const [apiError, setApiError] = useState('')
  const { data: membres = [], isLoading } = useEquipe()
  const inviter = useInviterMembre()
  const remove  = useRemoveMembre()
  const { max }   = usePlanLimit('max_membres', membres.length)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleInvite = async e => {
    e.preventDefault()
    setApiError('')
    try {
      await inviter.mutateAsync(form)
      setShowInvite(false)
      setForm({ nom: '', prenom: '', role: 'assistant' })
    } catch (err) {
      setApiError(err?.response?.data?.message ?? 'Une erreur est survenue.')
    }
  }

  return (
    <AppLayout
      title="Équipe"
      rightAction={
        can('equipe.manage') && max !== 0 ? (
          <button onClick={() => setShowInvite(true)} className="p-2 text-dim">
            <UserPlus size={18} />
          </button>
        ) : null
      }
    >
      <div className="p-4 space-y-2">
        {max === 0 ? (
          <div className="flex flex-col items-center gap-4 py-10 px-6 text-center bg-surface border border-border rounded-2xl">
            <Users size={32} className="text-content-secondary" />
            <div>
              <p className="font-semibold text-content mb-1">Membres d'équipe non inclus</p>
              <p className="text-sm text-content-secondary">
                Votre plan actuel ne permet pas d'ajouter des membres d'équipe. Passez à un plan supérieur pour collaborer.
              </p>
            </div>
            <Button variant="secondary" onClick={() => window.location.href = '/parametres'}>
              Voir les plans
            </Button>
          </div>
        ) : isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : membres.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun membre"
            description="Invitez des collaborateurs pour gérer l'atelier ensemble"
          />
        ) : (
          membres.map(m => (
            <MembreCard key={m.id} membre={m} onRemove={id => remove.mutate(id)} />
          ))
        )}

        {max !== null && max > 0 && (
          <p className="text-xs text-content-secondary text-center pt-2">
            {membres.length} / {max} membre{max > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <BottomSheet isOpen={showInvite} onClose={() => setShowInvite(false)} title="Ajouter un membre">
        <form onSubmit={handleInvite} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom" value={form.nom} onChange={set('nom')} placeholder="Koné" required />
            <Input label="Prénom" value={form.prenom} onChange={set('prenom')} placeholder="Kadiatou" required />
          </div>
          <Select label="Rôle" value={form.role} onChange={set('role')} options={ROLE_OPTIONS} />
          {apiError && <p className="text-sm text-danger">{apiError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowInvite(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" loading={inviter.isPending} className="flex-1">
              Ajouter
            </Button>
          </div>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}
