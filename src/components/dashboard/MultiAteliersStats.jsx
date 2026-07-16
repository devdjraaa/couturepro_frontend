import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Building2, ChevronDown, ChevronUp, RotateCw } from 'lucide-react'
import api from '@/services/api'
import { useAuth } from '@/contexts'
import { useMesAteliers } from '@/hooks/useMesAteliers'
import { formatCurrency } from '@/utils/formatCurrency'

// P100-101 : vue multi-ateliers du dashboard — totaux consolidés + comparaison par
// atelier (backend GET /dashboard/multi, cache serveur 60 s). Affichée uniquement au
// propriétaire ayant plusieurs ateliers ; silencieuse hors-ligne (données via l'API).
export default function MultiAteliersStats() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const { data: ateliers = [] } = useMesAteliers()

  const estProprio = user?.role === 'proprietaire'
  const multi = estProprio && Array.isArray(ateliers) && ateliers.length > 1

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['dashboard-multi'],
    queryFn: async () => (await api.get('/dashboard/multi')).data,
    enabled: multi,
    staleTime: 60_000,
    retry: 1,
  })

  if (!multi || !data?.ateliers?.length) return null

  const totaux = data.totaux ?? {}

  return (
    <div className="bg-card border border-edge rounded-2xl p-4">
      <div className="w-full flex items-center gap-2">
        <Building2 size={16} className="text-primary shrink-0" />
        <button type="button" onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-2 text-left">
          <p className="text-sm font-semibold text-ink flex-1">{t('dashboard.multi.titre')}</p>
          {open ? <ChevronUp size={16} className="text-ghost" /> : <ChevronDown size={16} className="text-ghost" />}
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          className="p-1 rounded-lg text-ghost hover:text-primary transition"
          aria-label={t('sync.refresh')}
        >
          <RotateCw size={13} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Totaux consolidés */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-subtle rounded-xl px-2 py-2 text-center">
          <p className="text-lg font-bold font-mono text-ink">{totaux.clients ?? 0}</p>
          <p className="text-[10px] text-ghost">{t('dashboard.multi.clients')}</p>
        </div>
        <div className="bg-subtle rounded-xl px-2 py-2 text-center">
          <p className="text-lg font-bold font-mono text-ink">{totaux.commandes_en_cours ?? 0}</p>
          <p className="text-[10px] text-ghost">{t('dashboard.multi.en_cours')}</p>
        </div>
        <div className="bg-subtle rounded-xl px-2 py-2 text-center">
          <p className="text-lg font-bold font-mono text-gold-dark">{formatCurrency(totaux.revenu_mois ?? 0)}</p>
          <p className="text-[10px] text-ghost">{t('dashboard.multi.revenu_mois')}</p>
        </div>
      </div>

      {/* Comparaison par atelier */}
      {open && (
        <div className="mt-3 space-y-1.5">
          {data.ateliers.map((a) => (
            <div key={a.atelier_id} className="flex items-center justify-between gap-2 bg-subtle rounded-xl px-3 py-2">
              <p className="text-sm font-medium text-ink truncate flex-1">{a.atelier_nom}</p>
              <span className="text-xs text-dim tabular-nums shrink-0">
                {t('dashboard.multi.cmd', { n: a.commandes?.en_cours ?? 0 })}
              </span>
              {(a.commandes?.en_retard ?? 0) > 0 && (
                <span className="text-xs text-error tabular-nums shrink-0">
                  {t('dashboard.multi.retard', { n: a.commandes.en_retard })}
                </span>
              )}
              <span className="text-xs font-semibold text-gold-dark font-mono shrink-0">
                {formatCurrency(a.finances?.encaisse_mois ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
