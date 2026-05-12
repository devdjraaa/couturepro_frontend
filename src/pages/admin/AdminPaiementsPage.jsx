import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, RotateCcw, MoreHorizontal } from 'lucide-react'
import { AdminLayout, AdminTable, AdminBadge, AtelierAvatar } from '@/components/admin'
import { useAdminPaiements, useValiderPaiement, useRembourserPaiement } from '@/hooks/admin/useAdminPaiements'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const STATUT_TABS = [
  { key: '',           dot: null,           label: key => 'Tous' },
  { key: 'pending',    dot: 'bg-warning',   label: t => t('admin.paiements.statuts.pending')   },
  { key: 'completed',  dot: 'bg-success',   label: t => t('admin.paiements.statuts.completed') },
  { key: 'failed',     dot: 'bg-danger',    label: t => t('admin.paiements.statuts.failed')    },
  { key: 'refunded',   dot: 'bg-accent',    label: t => t('admin.paiements.statuts.refunded')  },
]

const PROVIDERS = [
  { key: '',             label: 'Tous providers' },
  { key: 'orange_money', label: 'Orange Money'   },
  { key: 'wave',         label: 'Wave'            },
  { key: 'mtn_momo',     label: 'MTN MoMo'        },
]

const INPUT = 'border border-edge rounded-xl px-3 py-1.5 text-xs text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

export default function AdminPaiementsPage() {
  const { t } = useTranslation()
  const [statut,   setStatut]   = useState('')
  const [provider, setProvider] = useState('')

  const { data, isLoading } = useAdminPaiements({ statut, provider })
  const valider    = useValiderPaiement()
  const rembourser = useRembourserPaiement()

  const paiements = data?.data ?? []

  const columns = [
    {
      key: 'atelier',
      label: t('admin.paiements.col_atelier'),
      render: r => (
        <AtelierAvatar
          nom={r.atelier?.nom}
          sub={r.code_transaction ? `#${r.code_transaction}` : undefined}
        />
      ),
    },
    {
      key: 'niveau_cle',
      label: t('admin.paiements.col_plan'),
      render: r => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {r.niveau_cle ?? '—'}
        </span>
      ),
    },
    {
      key: 'montant',
      label: t('admin.paiements.col_montant'),
      render: r => (
        <span className="font-semibold text-ink tabular-nums">
          {r.montant?.toLocaleString()}{' '}
          <span className="text-ghost font-normal text-xs">XOF</span>
        </span>
      ),
    },
    {
      key: 'provider',
      label: t('admin.paiements.col_provider'),
      render: r => r.provider ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium bg-warning/10 text-warning border border-warning/20">
          {r.provider}
        </span>
      ) : '—',
    },
    {
      key: 'statut',
      label: t('admin.paiements.col_statut'),
      render: r => <AdminBadge value={r.statut} />,
    },
    {
      key: 'created_at',
      label: t('admin.paiements.col_date'),
      render: r => <span className="text-ghost text-xs whitespace-nowrap">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: r => (
        <div className="flex items-center gap-1.5">
          {(r.statut === 'pending' || r.statut === 'failed') && (
            <button
              onClick={() => valider.mutate(r.id)}
              className="inline-flex items-center gap-1 border border-success/30 text-success bg-success/5 hover:bg-success/10 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <CheckCircle size={12} />
              {t('admin.paiements.valider')}
            </button>
          )}
          {r.statut === 'completed' && (
            <button
              onClick={() => rembourser.mutate(r.id)}
              className="inline-flex items-center gap-1 border border-danger/30 text-danger bg-danger/5 hover:bg-danger/10 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw size={12} />
              {t('admin.paiements.rembourser')}
            </button>
          )}
          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-ghost hover:bg-subtle hover:text-ink transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title={t('admin.paiements.titre')}>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div className="flex flex-wrap gap-2">
          {STATUT_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatut(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statut === tab.key
                  ? 'bg-primary text-inverse'
                  : 'bg-subtle text-ghost hover:bg-inset hover:text-ink',
              )}
            >
              {tab.dot && <span className={cn('w-1.5 h-1.5 rounded-full', tab.dot)} />}
              {tab.label(t)}
            </button>
          ))}
        </div>
        <select value={provider} onChange={e => setProvider(e.target.value)} className={`${INPUT} sm:w-auto`}>
          {PROVIDERS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-ghost">{t('admin.commun.chargement')}</p>
      ) : (
        <>
          <AdminTable columns={columns} rows={paiements} emptyLabel={t('admin.paiements.aucun')} />
          {data?.total != null && (
            <p className="text-xs text-ghost mt-3 text-right">
              {data.total} paiement{data.total !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </AdminLayout>
  )
}
