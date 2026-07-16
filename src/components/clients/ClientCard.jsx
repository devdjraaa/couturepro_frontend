import { useTranslation } from 'react-i18next'
import { Share2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui'
import ClientAvatar from './ClientAvatar'
import { formatCurrency } from '@/utils/formatCurrency'

const TYPE_LABELS = {
  femme:  'Femme',
  homme:  'Homme',
  enfant: 'Enfant',
  mixte:  'Mixte',
}

export default function ClientCard({ client, onClick, badge }) {
  const { t } = useTranslation()
  const fullName  = `${client.prenom ?? ''} ${client.nom}`.trim()
  const typeLabel = TYPE_LABELS[client.type_profil] ?? client.type_profil ?? ''
  const solde     = client.total_restant ?? 0

  return (
    <Card onClick={onClick} className="flex items-center gap-3 p-4">
      <ClientAvatar client={client} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
          {/* P71 : provenance (recherche cross-ateliers) */}
          {badge && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-info/10 text-info shrink-0 truncate max-w-28">
              {badge}
            </span>
          )}
          {client.is_vip && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-gold-light text-gold-dark border-gold/20 shrink-0">
              VIP
            </span>
          )}
          {/* P77 : cliente partagée entre ateliers */}
          {client.partage && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 inline-flex items-center gap-0.5">
              <Share2 size={9} /> {t('clients.partage.badge')}
            </span>
          )}
          {typeLabel && (
            <span className="text-[10px] text-ghost shrink-0">{typeLabel}</span>
          )}
        </div>
        <p className="text-xs text-ghost mt-0.5">{client.telephone}</p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        {solde > 0 && (
          <p className="text-xs font-semibold text-gold-dark font-mono">{formatCurrency(solde)}</p>
        )}
        {client.points > 0 && solde === 0 && (
          <p className="text-xs text-accent-600 font-medium">{client.points} pts</p>
        )}
      </div>
    </Card>
  )
}
