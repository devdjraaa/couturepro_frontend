import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { useEquipe, useInviterMembre, useRemoveMembre } from '@/hooks/useEquipe'
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
  const [form, setForm] = useState({ nom: '', telephone: '', role: 'assistant' })
  const { data: membres = [], isLoading } = useEquipe()
  const inviter = useInviterMembre()
  const remove = useRemoveMembre()

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleInvite = async e => {
    e.preventDefault()
    await inviter.mutateAsync(form)
    setShowInvite(false)
    setForm({ nom: '', telephone: '', role: 'assistant' })
  }

  return (
    <AppLayout
      title="Équipe"
      rightAction={
        can('equipe.manage') ? (
          <button onClick={() => setShowInvite(true)} className="p-2 text-dim">
            <UserPlus size={18} />
          </button>
        ) : null
      }
    >
      <div className="p-4 space-y-2">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : membres.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun membre"
            description="Invitez des collaborateurs pour gérer l'atelier ensemble"
          />
        ) : (
          membres.map(m => (
            <MembreCard
              key={m.id}
              membre={m}
              onRemove={id => remove.mutate(id)}
            />
          ))
        )}
      </div>

      <BottomSheet isOpen={showInvite} onClose={() => setShowInvite(false)} title="Inviter un membre">
        <form onSubmit={handleInvite} className="p-5 space-y-4">
          <Input
            label="Nom"
            value={form.nom}
            onChange={set('nom')}
            placeholder="Kadiatou Koné"
            required
          />
          <Input
            label="Téléphone"
            type="tel"
            value={form.telephone}
            onChange={set('telephone')}
            placeholder="+225 07 00 00 00 00"
            required
          />
          <Select label="Rôle" value={form.role} onChange={set('role')} options={ROLE_OPTIONS} />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowInvite(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" loading={inviter.isPending} className="flex-1">
              Inviter
            </Button>
          </div>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}
