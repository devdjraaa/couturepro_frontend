import { useState } from 'react'
import { Gift } from 'lucide-react'
import { useHistoriquePoints, useConvertirPoints } from '@/hooks/usePoints'
import { useAtelier } from '@/contexts'
import { AppLayout } from '@/components/layout'
import { PointsSummary } from '@/components/points'
import { Button, Input, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { POINTS_VERS_JOURS } from '@/constants/config'

export default function PointsPage() {
  const { points } = useAtelier()
  const [montant, setMontant] = useState('')
  const { data: historique = [], isLoading } = useHistoriquePoints()
  const convertir = useConvertirPoints()

  const maxConvertible = Math.floor((points ?? 0) / POINTS_VERS_JOURS) * POINTS_VERS_JOURS
  const joursObtenus = Math.floor(Number(montant) / POINTS_VERS_JOURS)

  const handleConvertir = async e => {
    e.preventDefault()
    if (!montant || Number(montant) < POINTS_VERS_JOURS) return
    await convertir.mutateAsync(Number(montant))
    setMontant('')
  }

  return (
    <AppLayout title="Fidélité">
      <div className="p-4 space-y-6">
        <PointsSummary />

        {maxConvertible >= POINTS_VERS_JOURS && (
          <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Convertir des points</p>
            <p className="text-xs text-dim">{POINTS_VERS_JOURS} points = 1 jour d'abonnement offert</p>
            <form onSubmit={handleConvertir} className="flex gap-3">
              <Input
                type="number"
                min={POINTS_VERS_JOURS}
                max={maxConvertible}
                step={POINTS_VERS_JOURS}
                value={montant}
                onChange={e => setMontant(e.target.value)}
                placeholder={String(POINTS_VERS_JOURS)}
                className="flex-1"
              />
              <Button type="submit" loading={convertir.isPending} disabled={joursObtenus < 1}>
                {joursObtenus > 0 ? `+${joursObtenus} j` : 'Convertir'}
              </Button>
            </form>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-3">Historique</p>
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl mb-2" />)
          ) : historique.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Aucun historique"
              description="Vos gains de points apparaîtront ici"
            />
          ) : (
            <div className="space-y-2">
              {historique.map(h => (
                <div
                  key={h.id}
                  className="bg-card border border-edge rounded-xl flex justify-between items-center px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-ink">{h.description}</p>
                    <p className="text-xs text-ghost">{formatDate(h.created_at)}</p>
                  </div>
                  <span className={h.points > 0 ? 'text-success text-sm font-semibold' : 'text-danger text-sm font-semibold'}>
                    {h.points > 0 ? '+' : ''}{h.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
