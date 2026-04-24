import { Avatar, Card, StatusBadge } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate, isDatePast } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

export default function CommandeCard({ commande, onClick }) {
  const restant = commande.montant - (commande.avance ?? 0)
  const isLate = isDatePast(commande.date_livraison) && commande.statut === 'en_cours'

  return (
    <Card onClick={onClick} className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={commande.client_nom} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{commande.client_nom}</p>
            <p className="text-xs text-dim truncate">{commande.vetement_nom}</p>
          </div>
        </div>
        <StatusBadge statut={commande.statut} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={cn('text-ghost', isLate && 'text-danger font-medium')}>
          {formatDate(commande.date_livraison)}
        </span>
        <div className="text-right font-mono">
          <span className="font-semibold text-ink">{formatCurrency(commande.montant)}</span>
          {restant > 0 && (
            <span className="ml-1.5 text-warning">−{formatCurrency(restant)}</span>
          )}
        </div>
      </div>
    </Card>
  )
}
