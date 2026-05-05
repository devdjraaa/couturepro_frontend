import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Users, ClipboardList, UserPlus, Wallet, Bell, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { StatsGrid, RecentCommandes } from '@/components/dashboard'
import { FloatingActionButton, Skeleton, LanguageSwitcher } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useMesAteliers } from '@/hooks/useMesAteliers'
import { useCommandeStats } from '@/hooks/useCommandes'
import { useNotificationsCount } from '@/hooks/useNotifications'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── En-tête hero (mobile uniquement — remplace le header standard) ────────────
function DashboardHero({ user, stats, isLoading }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: notifCount = 0 } = useNotificationsCount()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.bonjour') : hour < 18 ? t('dashboard.bon_aprem') : t('dashboard.bonsoir')
  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const initials = user?.nom
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '—'

  return (
    <div className="lg:hidden bg-primary pt-safe px-5 pb-6 rounded-b-2xl">

      {/* Ligne du haut : avatar + salutation + badges */}
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-inverse/25 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-inverse">{initials}</span>
          </div>
          <div>
            <p className="text-xs text-inverse/70 capitalize">{dateStr}</p>
            <p className="text-sm font-semibold text-inverse">
              {greeting}, {user?.nom?.split(' ')[0] ?? ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="hero" />
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-inverse/10 transition-colors"
            aria-label={t('nav.notifications')}
          >
            <Bell size={20} className="text-inverse" />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Solde encaissé — carte verre dépoli */}
      <div className="mt-4 bg-inverse/15 rounded-2xl px-4 py-3.5 backdrop-blur-sm">
        <p className="text-xs text-inverse/75 font-medium">{t('dashboard.solde_encaisse')}</p>
        <p className="text-3xl font-bold font-display text-inverse mt-1 leading-none">
          {isLoading ? '—' : (stats ? formatCurrency(stats.total_encaisse) : '0 XOF')}
        </p>
        <p className="text-2xs text-inverse/60 mt-1.5">{t('dashboard.mise_a_jour')}</p>
      </div>
    </div>
  )
}

// ── Carte hero solde (desktop uniquement) ─────────────────────────────────────
function HeroCard({ stats, isLoading }) {
  const { t } = useTranslation()
  return (
    <div className="hidden lg:flex bg-card border border-edge rounded-2xl p-4 items-center justify-between">
      <div>
        <p className="text-xs text-ghost font-medium">{t('dashboard.solde_encaisse')}</p>
        {isLoading ? (
          <Skeleton className="h-9 w-32 mt-1 rounded-lg" />
        ) : (
          <p className="text-3xl font-bold font-display text-ink mt-1 leading-none">
            {stats ? formatCurrency(stats.total_encaisse) : '—'}
          </p>
        )}
        <p className="text-2xs text-ghost mt-1.5">{t('dashboard.revenus_mois')}</p>
      </div>
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <Wallet size={22} className="text-primary" />
      </div>
    </div>
  )
}

// ── Actions rapides ───────────────────────────────────────────────────────────
const ACTION_COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  info:    'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
}

const QUICK_ACTIONS = [
  { key: 'nouvelle_commande', icon: Plus,     color: 'primary', to: '/commandes/new' },
  { key: 'nouveau_client',    icon: UserPlus, color: 'info',    to: '/clients'       },
  { key: 'paiement',          icon: Wallet,   color: 'success', to: '/caisse'        },
]

function QuickActions() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest mb-3 px-0.5">
        {t('dashboard.actions_rapides')}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map(({ key, icon: Icon, color, to }) => (
          <button
            key={key}
            type="button"
            aria-label={t(`dashboard.action.${key}`)}
            onClick={() => navigate(to)}
            className="bg-card border border-edge rounded-xl p-3 flex flex-col items-center gap-2 transition-colors active:opacity-70 hover:border-edge-strong"
          >
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', ACTION_COLOR_MAP[color])}>
              <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-dim text-center leading-tight">
              {t(`dashboard.action.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Vue consolidée (propriétaire multi-ateliers) ──────────────────────────────
function ConsolidatedView({ ateliers, onSelect }) {
  const { t } = useTranslation()
  const totals = ateliers.reduce(
    (acc, a) => ({
      clients:   acc.clients   + (a.clients_count   ?? 0),
      commandes: acc.commandes + (a.commandes_count ?? 0),
    }),
    { clients: 0, commandes: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className="text-primary" />
            <span className="text-xs text-dim font-medium">{t('clients.titre')}</span>
          </div>
          <p className="text-2xl font-bold text-ink">{totals.clients}</p>
          <p className="text-2xs text-ghost mt-0.5">{t('dashboard.toutes_ateliers').toLowerCase()}</p>
        </div>
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={15} className="text-warning" />
            <span className="text-xs text-dim font-medium">{t('commandes.titre')}</span>
          </div>
          <p className="text-2xl font-bold text-ink">{totals.commandes}</p>
          <p className="text-2xs text-ghost mt-0.5">{t('dashboard.toutes_ateliers').toLowerCase()}</p>
        </div>
      </div>

      <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest px-0.5">
        {t('dashboard.stats_globales')}
      </h2>
      <div className="space-y-2">
        {ateliers.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full bg-card border border-edge rounded-2xl p-4 flex items-center gap-3 text-left hover:border-primary/40 transition-colors active:opacity-75"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink truncate">{a.nom}</p>
                {a.is_maitre && (
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    Maître
                  </span>
                )}
              </div>
              <p className="text-xs text-ghost mt-0.5">
                {a.clients_count ?? 0} {t('clients.titre').toLowerCase()}
                {' · '}
                {a.commandes_count ?? 0} {t('commandes.titre').toLowerCase()}
              </p>
            </div>
            <span className="text-sm text-primary font-medium shrink-0">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Filtre ateliers ───────────────────────────────────────────────────────────
function AtelierFilter({ ateliers, activeId, onSelect, onAll, showAll }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      <button
        onClick={onAll}
        className={cn(
          'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          showAll ? 'bg-primary text-inverse' : 'bg-subtle text-dim hover:text-ink',
        )}
      >
        {t('dashboard.toutes_ateliers')}
      </button>
      {ateliers.map(a => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            !showAll && activeId === a.id
              ? 'bg-primary text-inverse'
              : 'bg-subtle text-dim hover:text-ink',
          )}
        >
          {a.is_maitre && <Building2 size={10} />}
          {a.nom}
        </button>
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, atelier, switchAtelier } = useAuth()
  const { data: ateliers = [] } = useMesAteliers()
  const { data: stats, isLoading: loadingStats } = useCommandeStats()

  const isMulti = user?.role === 'proprietaire' && ateliers.length > 1
  const [showAll, setShowAll] = useState(false)

  const handleSelect = (a) => {
    switchAtelier(a)
    setShowAll(false)
  }

  return (
    <AppLayout title={t('dashboard.titre')} noMobileHeader>

      {/* Hero coloré — mobile uniquement */}
      <DashboardHero user={user} stats={stats} isLoading={loadingStats} />

      <div className="p-4 space-y-5">

        {/* Filtre multi-ateliers */}
        {isMulti && (
          <AtelierFilter
            ateliers={ateliers}
            activeId={atelier?.id}
            onSelect={handleSelect}
            onAll={() => setShowAll(true)}
            showAll={showAll}
          />
        )}

        {isMulti && showAll ? (
          <ConsolidatedView ateliers={ateliers} onSelect={handleSelect} />
        ) : (
          <>
            {/* Carte solde — desktop uniquement */}
            <HeroCard stats={stats} isLoading={loadingStats} />

            {/* Statistiques */}
            <StatsGrid />

            {/* Actions rapides */}
            <QuickActions />

            {/* Commandes récentes */}
            <div>
              <div className="flex items-center justify-between mb-3 px-0.5">
                <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest">
                  {t('dashboard.recentes')}
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/commandes')}
                  className="flex items-center gap-0.5 text-xs font-medium text-primary"
                >
                  {t('commun.voir_tout')}
                  <ChevronRight size={14} />
                </button>
              </div>
              <RecentCommandes />
            </div>
          </>
        )}
      </div>

      {!showAll && (
        <FloatingActionButton
          icon={Plus}
          onClick={() => navigate('/commandes/new')}
        />
      )}
    </AppLayout>
  )
}
