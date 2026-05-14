import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Building2, TicketCheck, CreditCard, KeyRound,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import { useAdminAuth } from '@/contexts'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminTickets } from '@/hooks/admin/useTickets'
import { useAdminPaiements } from '@/hooks/admin/useAdminPaiements'
import { cn } from '@/utils/cn'

// Palette interne : uniquement des tokens sémantiques
const ICON_COLORS = {
  primary: 'bg-primary/10 text-primary',
  accent:  'bg-accent/10  text-accent',
  danger:  'bg-danger/10  text-danger',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'primary', trend }) {
  let badge
  if (trend === undefined) {
    badge = (
      <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning">
        ↓ Action req.
      </span>
    )
  } else if (trend === null) {
    badge = (
      <span className="flex items-center gap-0.5 text-2xs font-medium px-2 py-0.5 rounded-full bg-subtle text-ghost">
        <Minus size={10} /> —
      </span>
    )
  } else if (trend >= 0) {
    badge = (
      <span className="flex items-center gap-0.5 text-2xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
        <ArrowUpRight size={11} /> +{trend}%
      </span>
    )
  } else {
    badge = (
      <span className="flex items-center gap-0.5 text-2xs font-medium px-2 py-0.5 rounded-full bg-danger/10 text-danger">
        <ArrowDownRight size={11} /> {trend}%
      </span>
    )
  }

  return (
    <div className="bg-card border border-edge rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', ICON_COLORS[color])}>
          <Icon size={18} />
        </div>
        {badge}
      </div>
      <p className="text-2xs text-ghost font-medium mb-0.5">{label}</p>
      <p className="text-3xl font-bold font-display text-ink">{value ?? '—'}</p>
      {sub && <p className="text-xs text-ghost mt-1">{sub}</p>}
    </div>
  )
}

// ── Quick access item ─────────────────────────────────────────────────────────
function QuickItem({ icon: Icon, color = 'primary', title, subtitle, to }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 w-full py-3 border-b border-edge last:border-0 hover:bg-subtle -mx-1 px-1 rounded-lg transition-colors text-left"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', ICON_COLORS[color])}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ghost">{subtitle}</p>
      </div>
      <ChevronRight size={15} className="text-ghost shrink-0" />
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const { admin } = useAdminAuth()
  const { data: ateliers  } = useAdminAteliers()
  const { data: tickets   } = useAdminTickets({ statut: 'ouvert' })
  const { data: paiements } = useAdminPaiements({ statut: 'pending' })

  const totalAteliers    = ateliers?.total ?? 0
  const ticketsOuverts   = tickets?.total ?? 0
  const paiementsPending = paiements?.total ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12
    ? t('admin.dashboard.greeting_matin')
    : hour < 18
      ? t('admin.dashboard.greeting_aprem')
      : t('admin.dashboard.greeting_soir')

  const SYSTEM_ITEMS = [
    { label: t('admin.dashboard.system_db'),           status: t('admin.dashboard.system_operationnel') },
    { label: t('admin.dashboard.system_api_paiements'),status: t('admin.dashboard.system_operationnel') },
    { label: t('admin.dashboard.system_notif'),        status: t('admin.dashboard.system_operationnel') },
  ]

  const QUICK_LINKS = [
    {
      icon: Building2, color: 'primary',
      title:    t('admin.dashboard.link_ateliers'),
      subtitle: t('admin.dashboard.link_ateliers_sub', { count: totalAteliers }),
      to: '/admin/ateliers',
    },
    {
      icon: CreditCard, color: 'danger',
      title:    t('admin.dashboard.link_paiements'),
      subtitle: t('admin.dashboard.link_paiements_sub', { count: paiementsPending }),
      to: '/admin/paiements',
    },
    {
      icon: TicketCheck, color: 'accent',
      title:    t('admin.dashboard.link_tickets'),
      subtitle: t('admin.dashboard.link_tickets_sub', { count: ticketsOuverts }),
      to: '/admin/tickets',
    },
    {
      icon: KeyRound, color: 'success',
      title:    t('admin.dashboard.link_transactions'),
      subtitle: t('admin.dashboard.link_transactions_sub'),
      to: '/admin/ateliers',
    },
  ]

  return (
    <AdminLayout title={t('admin.nav.dashboard')}>
      {/* Greeting */}
      <p className="text-sm text-ghost mb-6">
        {greeting},{' '}
        <span className="font-semibold text-ink">{admin?.prenom} {admin?.nom}</span>
        {' '}
        <span className="text-ghost">{t('admin.dashboard.apercu')}</span>
      </p>

      {/* 3-column stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label={t('admin.dashboard.ateliers')}
          value={totalAteliers}
          sub={t('admin.dashboard.stat_enregistres', { count: totalAteliers })}
          icon={Building2}
          color="primary"
          trend={null}
        />
        <StatCard
          label={t('admin.dashboard.tickets_ouverts')}
          value={ticketsOuverts}
          sub={t(ticketsOuverts === 0 ? 'admin.dashboard.stat_aucun_attente' : 'admin.dashboard.stat_en_attente', { count: ticketsOuverts })}
          icon={TicketCheck}
          color="accent"
          trend={null}
        />
        <StatCard
          label={t('admin.dashboard.paiements_attente')}
          value={paiementsPending}
          sub={t('admin.dashboard.stat_valider')}
          icon={CreditCard}
          color="danger"
          trend={null}
        />
      </div>

      {/* Accès rapides + État du système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-edge rounded-xl p-5">
          <p className="text-sm font-semibold text-ink mb-2">{t('admin.dashboard.acces_rapides')}</p>
          {QUICK_LINKS.map(item => (
            <QuickItem key={item.to + item.title} {...item} />
          ))}
        </div>

        <div className="bg-card border border-edge rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink">{t('admin.dashboard.system_titre')}</p>
            <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              {t('admin.dashboard.system_ok')}
            </span>
          </div>
          {SYSTEM_ITEMS.map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-edge last:border-0">
              <span className="text-sm text-ghost">{label}</span>
              <span className="text-sm text-ink font-medium">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
