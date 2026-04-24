import { cn } from '@/utils/cn'
import { Avatar, Card } from '@/components/ui'

const PROFIL_STYLES = {
  vip:         { label: 'VIP',       className: 'bg-accent/10 text-accent-600 border-accent/20' },
  regulier:    { label: 'Régulier',  className: 'bg-primary/10 text-primary border-primary/20' },
  occasionnel: { label: 'Occasion.', className: 'bg-subtle text-ghost border-edge' },
}

export default function ClientCard({ client, onClick }) {
  const profil = PROFIL_STYLES[client.profil] ?? PROFIL_STYLES.occasionnel

  return (
    <Card onClick={onClick} className="flex items-center gap-3 p-4">
      <Avatar name={client.nom} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink truncate">{client.nom}</p>
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border shrink-0',
            profil.className,
          )}>
            {profil.label}
          </span>
        </div>
        <p className="text-xs text-ghost mt-0.5">{client.telephone}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-dim">{client.commandes_count} cmd</p>
        {client.points > 0 && (
          <p className="text-xs text-accent-600 font-medium">{client.points} pts</p>
        )}
      </div>
    </Card>
  )
}
