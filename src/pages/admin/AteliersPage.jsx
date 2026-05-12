import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { AdminLayout, AdminBadge } from '@/components/admin'
import { useAdminAteliers, useGelerAtelier, useDegelerAtelier } from '@/hooks/admin/useAteliers'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

/* ── helpers ─────────────────────────────────────── */
const PALETTE = [
  'bg-primary/20 text-primary',
  'bg-accent/20  text-accent',
  'bg-success/20 text-success',
  'bg-danger/20  text-danger',
  'bg-warning/20 text-warning',
  'bg-info/20    text-info',
]
const colorFor  = (name = '') => PALETTE[(name.charCodeAt(0) ?? 0) % PALETTE.length]
const initials  = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
const shortId   = (id  = '') => `#${String(id).replace(/-/g, '').slice(0, 8)}`

/* ── statut pill config ──────────────────────────── */
const STATUTS = [
  { key: '',       dot: null,            labelKey: 'admin.ateliers.statuts.tous'   },
  { key: 'actif',  dot: 'bg-success',    labelKey: 'admin.ateliers.statuts.actif'  },
  { key: 'expire', dot: 'bg-warning',    labelKey: 'admin.ateliers.statuts.expire' },
  { key: 'gele',   dot: 'bg-danger',     labelKey: 'admin.ateliers.statuts.gele'   },
]

/* ── StatusPills ─────────────────────────────────── */
function StatusPills({ value, onChange, counts }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-0.5 bg-inset border border-edge rounded-full p-1">
      {STATUTS.map(({ key, dot, labelKey }) => {
        const active = value === key
        const count  = counts?.[key || 'all']
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              active
                ? 'bg-card text-ink border border-edge shadow-sm'
                : 'text-ghost hover:text-dim',
            )}
          >
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
            {t(labelKey)}
            {count != null && (
              <span className={cn(
                'text-2xs font-semibold rounded-full px-1.5 min-w-[20px] text-center leading-5',
                active ? 'bg-primary/15 text-primary' : 'bg-subtle text-ghost',
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ── Paginator ───────────────────────────────────── */
function Paginator({ current, last, onPage }) {
  if (last < 1) return null

  const pages = []
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3)         pages.push('…')
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i)
    if (current < last - 2)  pages.push('…')
    pages.push(last)
  }

  const btnBase = 'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPage(current - 1)} disabled={current <= 1}
        className={cn(btnBase, 'border border-edge text-ghost hover:text-ink hover:border-edge-strong disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronLeft size={13} />
      </button>

      {pages.map((p, i) => p === '…' ? (
        <span key={`el-${i}`} className="px-1 text-ghost text-xs select-none">…</span>
      ) : (
        <button
          key={p} onClick={() => onPage(p)}
          className={cn(btnBase, p === current
            ? 'bg-primary text-inverse'
            : 'border border-edge text-ghost hover:text-ink hover:border-edge-strong')}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPage(current + 1)} disabled={current >= last}
        className={cn(btnBase, 'border border-edge text-ghost hover:text-ink hover:border-edge-strong disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronRight size={13} />
      </button>
    </div>
  )
}

/* ── Page principale ─────────────────────────────── */
export default function AteliersPage() {
  const { t }    = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('')
  const [page,   setPage]   = useState(1)

  const { data, isLoading } = useAdminAteliers({ search, statut, page })
  const geler   = useGelerAtelier()
  const degeler = useDegelerAtelier()

  const ateliers    = data?.data          ?? []
  const totalCount  = data?.total         ?? 0
  const currentPage = data?.current_page  ?? 1
  const lastPage    = data?.last_page     ?? 1
  const fromItem    = data?.from          ?? 0
  const toItem      = data?.to            ?? 0
  const counts      = data?.counts        ?? null

  const changeStatut = key => { setStatut(key); setPage(1) }
  const changeSearch = val => { setSearch(val);  setPage(1) }

  return (
    <AdminLayout title={t('admin.ateliers.titre')}>
      <div className="bg-card border border-edge rounded-xl overflow-hidden">

        {/* ── Barre de filtre ── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3 border-b border-edge">
          {/* Recherche */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost pointer-events-none" />
            <input
              value={search}
              onChange={e => changeSearch(e.target.value)}
              placeholder={t('admin.ateliers.chercher')}
              className="w-full border border-edge rounded-xl pl-9 pr-3 py-2 text-sm text-ink bg-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Statuts + filtres */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <StatusPills value={statut} onChange={changeStatut} counts={counts} />
            <button className="inline-flex items-center gap-1.5 border border-edge rounded-full px-3 py-1.5 text-xs font-medium text-ghost hover:text-ink hover:border-edge-strong transition-colors">
              <SlidersHorizontal size={12} />
              {t('admin.ateliers.filtres')}
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        {isLoading ? (
          <p className="text-sm text-ghost px-4 py-8">{t('admin.commun.chargement')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge bg-subtle/50">
                  {['admin.ateliers.col_atelier', 'admin.ateliers.col_proprietaire', 'admin.atelier_detail.plan',
                    'admin.ateliers.col_statut', 'admin.ateliers.col_clients', 'admin.ateliers.col_commandes',
                    'admin.ateliers.col_cree_le'].map(key => (
                    <th key={key} className="text-left text-2xs font-semibold text-ghost uppercase tracking-widest px-4 py-3 whitespace-nowrap">
                      {t(key)}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {ateliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-ghost text-sm">
                      {t('admin.ateliers.aucun')}
                    </td>
                  </tr>
                ) : ateliers.map(r => {
                  const planLabel = r.abonnement?.niveau?.label ?? r.abonnement?.niveau_cle ?? null
                  return (
                    <tr key={r.id} className="hover:bg-subtle/60 transition-colors group">

                      {/* Atelier */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/ateliers/${r.id}`)}
                          className="flex items-center gap-3 text-left group-hover:opacity-90 transition-opacity"
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                            colorFor(r.nom),
                          )}>
                            {initials(r.nom)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink leading-snug truncate max-w-[160px]">
                              {r.nom}
                            </p>
                            <p className="text-2xs text-ghost font-mono mt-0.5">
                              {shortId(r.id)}
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Propriétaire */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-ink">
                          {r.proprietaire
                            ? `${r.proprietaire.prenom} ${r.proprietaire.nom}`
                            : '—'}
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3">
                        {planLabel ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-dim">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            {planLabel}
                          </span>
                        ) : (
                          <span className="text-xs text-ghost">—</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <AdminBadge value={r.statut} />
                      </td>

                      {/* Clients */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-sm font-semibold tabular-nums',
                          (r.clients_count ?? 0) === 0 ? 'text-ghost font-normal' : 'text-ink',
                        )}>
                          {r.clients_count ?? 0}
                        </span>
                      </td>

                      {/* Commandes */}
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-sm font-semibold tabular-nums',
                          (r.commandes_count ?? 0) === 0 ? 'text-ghost font-normal' : 'text-ink',
                        )}>
                          {r.commandes_count ?? 0}
                        </span>
                      </td>

                      {/* Créé le */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-dim tabular-nums">
                          {formatDate(r.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {r.statut === 'gele' ? (
                          <button
                            onClick={() => degeler.mutate(r.id)}
                            disabled={degeler.isPending}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/25 hover:bg-success/15 disabled:opacity-50 transition-colors"
                          >
                            {t('admin.commun.degeler')}
                          </button>
                        ) : (
                          <button
                            onClick={() => geler.mutate(r.id)}
                            disabled={geler.isPending}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-danger/10 text-danger border border-danger/25 hover:bg-danger/15 disabled:opacity-50 transition-colors"
                          >
                            {t('admin.commun.geler')}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer pagination ── */}
        {!isLoading && totalCount > 0 && (
          <div className="flex items-center justify-center px-4 py-3 border-t border-edge">
            <Paginator current={currentPage} last={lastPage} onPage={setPage} />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
