import { cn } from '@/utils/cn'
import { Card } from '@/components/ui'
import ClientAvatar from './ClientAvatar'

const TYPE_LABELS = {
  femme:  'Femme',
  homme:  'Homme',
  enfant: 'Enfant',
  mixte:  'Mixte',
}

export default function ClientCard({ client, onClick }) {
  const fullName = `${client.prenom ?? ''} ${client.nom}`.trim()
  const typeLabel = TYPE_LABELS[client.type_profil] ?? client.type_profil ?? ''

  return (
    <Card onClick={onClick} className="flex items-center gap-3 p-4">
      <ClientAvatar client={client} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
          {client.is_vip && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-accent/10 text-accent-600 border-accent/20 shrink-0">
              VIP
            </span>
          )}
          {typeLabel && (
            <span className="text-[10px] text-ghost shrink-0">{typeLabel}</span>
          )}
        </div>
        <p className="text-xs text-ghost mt-0.5">{client.telephone}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-dim">{client.commandes_count ?? 0} cmd</p>
        {client.points > 0 && (
          <p className="text-xs text-accent-600 font-medium">{client.points} pts</p>
        )}
      </div>
    </Card>
  )
}
