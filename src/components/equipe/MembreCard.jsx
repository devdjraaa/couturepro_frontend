import { Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/contexts'
import { cn } from '@/utils/cn'

const ROLE_STYLES = {
  proprietaire: { label: 'Propriétaire', className: 'bg-accent/10 text-accent-600' },
  assistant:    { label: 'Assistant',    className: 'bg-primary/10 text-primary'    },
  membre:       { label: 'Membre',       className: 'bg-subtle text-dim'            },
}

export default function MembreCard({ membre, onRemove }) {
  const { user, can } = useAuth()
  const role     = ROLE_STYLES[membre.role] ?? ROLE_STYLES.membre
  const isSelf   = user?.id === membre.id
  const canRemove = can('equipe.manage') && !isSelf && membre.role !== 'proprietaire'

  return (
    <div className="bg-card border border-edge rounded-xl flex items-center gap-3 p-4">
      <Avatar name={membre.nom} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{membre.nom}</p>
        <p className="text-xs text-ghost">{membre.telephone}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', role.className)}>
          {role.label}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove?.(membre.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ghost hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
