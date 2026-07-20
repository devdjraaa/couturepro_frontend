import { useTranslation } from 'react-i18next'
import { Avatar, Card, StatusPill, CountdownBadge } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function CommandeCard({ commande, onClick, compact = false }) {
  const { t }   = useTranslation()
  const prix    = Number(commande.prix ?? 0)
  const acompte = Number(commande.acompte ?? 0)
  const restant = Math.max(0, prix - acompte)
  const paidPct = prix > 0 ? Math.min(100, (acompte / prix) * 100) : 0
  const solde   = paidPct >= 100

  // Une commande dont le prix n'est pas encore fixé n'est ni soldée ni en
  // reste : avec `prix = 0`, `paidPct` valait 0, donc on tombait dans la branche
  // « reste à payer » et chaque carte affichait « −0 XOF » — un zéro négatif.
  const prixDefini = prix > 0

  return (
    <Card onClick={onClick} className="p-4">
      {/* En-tête : client + délai */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={commande.client_nom} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-ink truncate">{commande.client_nom}</p>
              {commande.urgence && (
                <AlertTriangle size={11} className="text-warning shrink-0" />
              )}
            </div>
            <p className="text-xs text-ghost truncate">{commande.vetement_nom}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {commande.date_livraison_prevue && (
            <CountdownBadge dueDate={commande.date_livraison_prevue} />
          )}
        </div>
      </div>

      {!compact && (
        /* Paiement progress */
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-ghost font-mono">
              {prixDefini ? formatCurrency(prix) : t('commandes.prix_a_definir')}
            </span>
            {prixDefini && (
              solde ? (
                <span className="text-success font-medium">{t('commandes.solde')}</span>
              ) : (
                <span className="font-mono font-semibold text-gold-dark">−{formatCurrency(restant)}</span>
              )
            )}
          </div>
          <div className="h-1.5 rounded-full bg-subtle overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', solde ? 'bg-success' : 'bg-primary')}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
