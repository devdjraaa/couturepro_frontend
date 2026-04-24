import { ProgressBar } from '@/components/ui'
import { useAtelier } from '@/contexts'

export default function QuotaBar() {
  const { limits, clientsUtilises, commandesCeMois } = useAtelier()

  const isUnlimited = !limits?.clients || limits.clients === Infinity

  if (isUnlimited) {
    return (
      <p className="text-xs text-ghost text-center py-2">Quota illimité — plan Pro actif</p>
    )
  }

  const clientsPct = Math.min(100, Math.round((clientsUtilises / limits.clients) * 100))
  const cmdPct     = Math.min(100, Math.round((commandesCeMois / limits.commandes) * 100))

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-xs text-dim mb-1.5">
          <span>Clients</span>
          <span className="font-medium text-ink">{clientsUtilises} / {limits.clients}</span>
        </div>
        <ProgressBar value={clientsPct} />
      </div>
      <div>
        <div className="flex justify-between text-xs text-dim mb-1.5">
          <span>Commandes ce mois</span>
          <span className="font-medium text-ink">{commandesCeMois} / {limits.commandes}</span>
        </div>
        <ProgressBar value={cmdPct} />
      </div>
    </div>
  )
}
