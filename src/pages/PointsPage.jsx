import { Gift, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { usePoints, useConvertirPoints } from '@/hooks/usePoints'
import { AppLayout } from '@/components/layout'
import { PointsSummary } from '@/components/points'
import { Button, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { POINTS_VERS_JOURS } from '@/constants/config'

const SEUIL_DEFAUT = 10000

export default function PointsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, refetch } = usePoints()
  const convertir = useConvertirPoints()

  const solde = data?.solde_pts ?? 0
  const seuil = data?.seuil_conversion ?? SEUIL_DEFAUT
  const historique = data?.historique ?? []
  const joursObtenus = Math.floor(solde / POINTS_VERS_JOURS)

  if (isError) {
    return (
      <AppLayout title={t('points.titre')} showBack>
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm text-dim">{t('points.erreur_chargement')}</p>
          <Button variant="secondary" icon={RefreshCw} onClick={refetch}>
            {t('commun.reessayer')}
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t('points.titre')} onRefresh={() => queryClient.invalidateQueries()}>
      <div className="p-4 space-y-6">
        <PointsSummary />

        {/* PL-9 : programme de fidélité avancé (Studio) — paliers cumulés */}
        {data?.paliers && (
          <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">{t('points.paliers.titre')}</p>
              <span className="text-xs font-bold text-primary bg-primary-50 px-2.5 py-0.5 rounded-full">
                {data.paliers.palier_actuel.nom}
              </span>
            </div>
            {data.paliers.palier_suivant ? (
              <>
                <div className="h-2 bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.round(100 * data.paliers.cumul_pts / data.paliers.palier_suivant.seuil))}%` }}
                  />
                </div>
                <p className="text-xs text-dim">
                  {t('points.paliers.restant', { pts: data.paliers.restant_pts.toLocaleString('fr-FR'), palier: data.paliers.palier_suivant.nom })}
                </p>
              </>
            ) : (
              <p className="text-xs text-success font-medium">{t('points.paliers.max')}</p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.paliers.echelle.map(p => (
                <span key={p.cle}
                  className={cn('text-2xs px-2 py-0.5 rounded-full',
                    data.paliers.cumul_pts >= p.seuil ? 'bg-primary/10 text-primary font-semibold' : 'bg-subtle text-ghost')}>
                  {p.nom}
                </span>
              ))}
            </div>
          </div>
        )}

        {solde >= seuil && (
          <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-ink">{t('points.conversion.titre')}</p>
            <p className="text-xs text-dim">{POINTS_VERS_JOURS} {t('points.conversion.sous_titre', { points: POINTS_VERS_JOURS, jours: 1 })}</p>
            <p className="text-xs text-dim font-semibold">
              {joursObtenus} jour{joursObtenus > 1 ? 's' : ''} disponible{joursObtenus > 1 ? 's' : ''}
            </p>
            <Button
              loading={convertir.isPending}
              onClick={() => convertir.mutate()}
              className="w-full"
            >
              {t('points.conversion.convertir')}
            </Button>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-3">{t('points.historique.titre')}</p>
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl mb-2" />)
          ) : historique.length === 0 ? (
            <EmptyState
              icon={Gift}
              title={t('points.historique.vide')}
              description="Chaque commande livrée vous rapporte des points. Créez votre première commande pour commencer à en accumuler."
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
