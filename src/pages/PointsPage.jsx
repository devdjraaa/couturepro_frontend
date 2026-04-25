import { Gift } from 'lucide-react'
import { usePoints, useConvertirPoints } from '@/hooks/usePoints'
import { AppLayout } from '@/components/layout'
import { PointsSummary } from '@/components/points'
import { Button, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { POINTS_VERS_JOURS } from '@/constants/config'

export default function PointsPage() {
  const { data, isLoading } = usePoints()
  const convertir = useConvertirPoints()

  const solde = data?.solde_pts ?? 0
  const seuil = data?.seuil_conversion ?? POINTS_VERS_JOURS
  const historique = data?.historique ?? []
  const joursObtenus = Math.floor(solde / POINTS_VERS_JOURS)

  return (
    <AppLayout title="Fidélité">
      <div className="p-4 space-y-6">
        <PointsSummary />

        {solde >= seuil && (
          <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">Convertir des points</p>
            <p className="text-xs text-dim">{POINTS_VERS_JOURS} points = 1 jour d'abonnement offert</p>
            <p className="text-xs text-dim font-semibold">
              {joursObtenus} jour{joursObtenus > 1 ? 's' : ''} disponible{joursObtenus > 1 ? 's' : ''}
            </p>
            <Button
              loading={convertir.isPending}
              onClick={() => convertir.mutate()}
              className="w-full"
            >
              Convertir mes points
            </Button>
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
