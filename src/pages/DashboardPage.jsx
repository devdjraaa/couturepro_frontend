import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Wallet, ClipboardList, ChevronRight, AlertTriangle, Clock, CheckCircle2, CircleUser, Sun, Moon, Store, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isToday, isPast, parseISO, differenceInCalendarDays, isThisMonth, subDays } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout'
import { Skeleton, EmptyState, Button, CountdownBadge, MoneyAmount, QuickActionTile, LanguageSwitcher } from '@/components/ui'
import { useAuth, useTheme } from '@/contexts'
import { useCommandes, useCommandeStats } from '@/hooks/useCommandes'
import { useClients } from '@/hooks/useClients'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Salutation ───────────────────────────────────────────────────────────────
function Greeting({ user, subtitle, hero = false }) {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.bonjour') : hour < 18 ? t('dashboard.bon_aprem') : t('dashboard.bonsoir')
  const dateStr  = new Date().toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className={hero ? 'pt-2 pb-1' : 'pt-4 pb-2'}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn('text-xs capitalize mb-0.5', hero ? 'text-inverse/60' : 'text-ghost')}>{dateStr}</p>
          <h1 className={cn('text-xl font-bold font-display', hero ? 'text-inverse' : 'text-ink')}>
            {greeting}, {user?.prenom ?? user?.nom?.split(' ')[0] ?? ''} 👋
          </h1>
        </div>
        {hero && (
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-inverse/10 transition-colors"
              aria-label={isDark ? t('commun.passer_mode_clair') : t('commun.passer_mode_sombre')}
            >
              {isDark ? <Sun size={18} className="text-inverse" /> : <Moon size={18} className="text-inverse" />}
            </button>
            <LanguageSwitcher variant="hero" />
          </div>
        )}
      </div>
      {subtitle && (
        <p className={cn('text-sm mt-1', hero ? 'text-inverse/70' : 'text-ghost')}>{subtitle}</p>
      )}
    </div>
  )
}

// ── Caisse du jour ────────────────────────────────────────────────────────────
function CaisseCard({ stats, isLoading, navigate }) {
  const { t } = useTranslation()
  const encaisse = stats?.total_encaisse ?? 0

  return (
    <div className="rounded-2xl bg-primary-700 p-4 text-inverse">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-inverse/70">{t('dashboard.caisse.titre')}</p>
        <button
          type="button"
          onClick={() => navigate('/caisse')}
          className="flex items-center gap-1 text-xs text-inverse/70 hover:text-inverse transition-colors"
        >
          {t('dashboard.caisse.voir_detail')} <ChevronRight size={12} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-9 w-40 rounded-lg bg-inverse/10 animate-pulse mt-2" />
      ) : encaisse === 0 ? (
        <div className="mt-2">
          <p className="text-sm text-inverse/60">{t('dashboard.caisse.vide')}</p>
          <button
            type="button"
            onClick={() => navigate('/caisse')}
            className="mt-2 text-xs font-medium text-inverse/90 underline underline-offset-2"
          >
            {t('dashboard.caisse.enregistrer')}
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <MoneyAmount value={encaisse} size="lg" className="text-inverse" />
          <p className="text-xs text-inverse/50 mt-1">{t('dashboard.caisse.encaisse_auj')}</p>
        </div>
      )}
    </div>
  )
}

// ── Élément "À faire" ─────────────────────────────────────────────────────────
function TodoItem({ label, client, dueDate, type, to, navigate }) {
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 w-full py-3 border-b border-edge last:border-0 hover:bg-subtle -mx-1 px-1 rounded-lg transition-colors text-left"
    >
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
        type === 'retard'  ? 'bg-danger/10' :
        type === 'essai'   ? 'bg-accent-50' :
        type === 'solde'   ? 'bg-gold-light' :
        'bg-primary-50',
      )}>
        {type === 'retard'  ? <AlertTriangle size={14} className="text-danger" /> :
         type === 'essai'   ? <Clock size={14} className="text-accent-600" /> :
         type === 'solde'   ? <Wallet size={14} className="text-gold-dark" /> :
         <ClipboardList size={14} className="text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{label}</p>
        <p className="text-xs text-ghost">{client}</p>
      </div>
      {dueDate && <CountdownBadge dueDate={dueDate} />}
    </button>
  )
}

function TodoList({ commandes, isLoading, navigate }) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const items = []
  commandes.forEach(cmd => {
    if (!cmd || cmd.statut === 'livre' || cmd.statut === 'annule') return
    const dateLiv = cmd.date_livraison_prevue ? parseISO(cmd.date_livraison_prevue) : null
    const dateEss = cmd.date_essayage         ? parseISO(cmd.date_essayage)         : null
    const restant = (cmd.prix ?? 0) - (cmd.acompte ?? 0)
    const to = `/commandes/${cmd.id}`
    const vetement = cmd.vetement_nom ?? t('catalogue.titre')

    if (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) {
      const type = isPast(dateLiv) && !isToday(dateLiv) ? 'retard' : 'livraison'
      items.push({ type, label: t('dashboard.todo.livraison', { vetement }), client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: type === 'retard' ? 0 : 1 })
    } else if (dateEss && isToday(dateEss)) {
      items.push({ type: 'essai', label: t('dashboard.todo.essayage', { vetement }), client: cmd.client_nom, dueDate: cmd.date_essayage, to, priority: 1 })
    } else if (restant > 0 && dateLiv && differenceInCalendarDays(dateLiv, today) <= 3) {
      items.push({ type: 'solde', label: t('dashboard.todo.solde', { montant: formatCurrency(restant) }), client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: 2 })
    }
  })

  items.sort((a, b) => a.priority - b.priority)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={t('dashboard.todo.libre')}
        description={t('dashboard.todo.libre_desc')}
        primaryAction={
          <Button size="sm" variant="secondary" onClick={() => navigate('/commandes')}>
            {t('dashboard.todo.voir_commandes')}
          </Button>
        }
        className="py-6"
      />
    )
  }

  return (
    <div className="-mt-1">
      {items.slice(0, 6).map((item, i) => (
        <TodoItem key={i} {...item} navigate={navigate} />
      ))}
    </div>
  )
}

// ── Onboarding checklist ─────────────────────────────────────────────────────
const ONBOARDING_DISMISS_KEY = 'gx_onboarding_done'

function WelcomeChecklist({ user, atelier, clients, commandes, isLoading, navigate }) {
  const { t } = useTranslation()
  const [dismissed, setDismissed] = useState(() => {
    try { return !!localStorage.getItem(ONBOARDING_DISMISS_KEY) } catch { return false }
  })

  const dismiss = () => {
    try { localStorage.setItem(ONBOARDING_DISMISS_KEY, '1') } catch { /* indisponible */ }
    setDismissed(true)
  }

  if (isLoading || dismissed) return null

  const steps = [
    {
      icon: CircleUser,
      label: t('dashboard.onboarding.step_profil'),
      sub: t('dashboard.onboarding.step_profil_sub'),
      done: !!user?.telephone,
      to: '/parametres/profil',
    },
    {
      icon: Store,
      label: 'Configurer ma vitrine',
      sub: 'Ajoutez votre bio et spécialité pour attirer des clients',
      done: !!(atelier?.bio),
      to: '/ma-vitrine',
    },
    {
      icon: UserPlus,
      label: t('dashboard.onboarding.step_client'),
      sub: t('dashboard.onboarding.step_client_sub'),
      done: clients.length > 0,
      to: '/clients',
    },
    {
      icon: ClipboardList,
      label: t('dashboard.onboarding.step_commande'),
      sub: t('dashboard.onboarding.step_commande_sub'),
      done: commandes.length > 0,
      to: '/commandes/new',
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="bg-card border border-edge rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary/8 to-accent/5 px-4 pt-4 pb-3 border-b border-edge">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-ink">{t('dashboard.onboarding.titre')}</p>
            <p className="text-xs text-ghost mt-0.5">{t('dashboard.onboarding.etapes', { fait: doneCount, total: steps.length })}</p>
          </div>
          <button onClick={dismiss} aria-label="Masquer" className="w-7 h-7 flex items-center justify-center rounded-full text-ghost hover:text-ink transition shrink-0">
            <X size={14} />
          </button>
        </div>
        <div className="mt-2.5 h-1 bg-edge rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="divide-y divide-edge">
        {steps.map((step, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !step.done && navigate(step.to)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
              !step.done && 'hover:bg-subtle active:bg-subtle/70',
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              step.done ? 'bg-success/10' : 'bg-primary/8',
            )}>
              {step.done
                ? <CheckCircle2 size={16} className="text-success" />
                : <step.icon size={15} className="text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium leading-tight',
                step.done ? 'line-through text-ghost' : 'text-ink',
              )}>
                {step.label}
              </p>
              <p className="text-xs text-ghost mt-0.5">{step.sub}</p>
            </div>
            {!step.done && <ChevronRight size={14} className="text-ghost shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── KPIs horizontaux ──────────────────────────────────────────────────────────
function KpiChip({ label, value, color = 'default', trend }) {
  const colors = {
    default: 'bg-card border-edge text-ink',
    gold:    'bg-gold-light border-gold/30 text-gold-dark',
    success: 'bg-success/8 border-success/20 text-success',
    primary: 'bg-primary-50 border-primary/20 text-primary-700',
    danger:  'bg-danger/8 border-danger/20 text-danger',
  }
  return (
    <div className={cn('shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border', colors[color])}>
      <div className="flex items-baseline gap-1">
        <span className="font-mono font-bold text-lg tabular-nums leading-tight">{value ?? '—'}</span>
        {trend != null && trend !== 0 && (
          <span className={cn('text-2xs font-bold leading-tight', trend > 0 ? 'text-success' : 'text-danger')}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <span className="text-2xs font-medium mt-0.5 whitespace-nowrap opacity-70">{label}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user, atelier }  = useAuth()
  const { data: commandes = [], isLoading: loadingCmd } = useCommandes()
  const { data: stats,          isLoading: loadingStats } = useCommandeStats()
  const { data: clients = [] }  = useClients()

  const activeCount   = commandes.filter(c => c.statut === 'en_cours' || c.statut === 'essai').length
  const livreCeMois   = commandes.filter(c => c.statut === 'livre' && c.date_livraison_prevue && isThisMonth(parseISO(c.date_livraison_prevue))).length
  const totalRestant  = stats?.total_restant ?? 0
  const lateCount     = stats?.en_retard ?? 0

  const now = new Date()
  const date30j = subDays(now, 30)
  const date60j = subDays(now, 60)
  const nouveauxClients     = clients.filter(c => c.created_at && parseISO(c.created_at) >= date30j).length
  const nouveauxClientsPrev = clients.filter(c => { if (!c.created_at) return false; const d = parseISO(c.created_at); return d >= date60j && d < date30j }).length
  const tendanceClients     = nouveauxClients - nouveauxClientsPrev
  const urgentToday   = commandes.filter(c => {
    if (c.statut === 'livre' || c.statut === 'annule') return false
    const dateLiv = c.date_livraison_prevue ? parseISO(c.date_livraison_prevue) : null
    const dateEss = c.date_essayage ? parseISO(c.date_essayage) : null
    return (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) || (dateEss && isToday(dateEss))
  }).length

  const dynamicSub = urgentToday > 0
    ? t('dashboard.subtitle.urgentes', { count: urgentToday })
    : activeCount > 0 ? t('dashboard.subtitle.en_cours', { count: activeCount }) : null

  return (
    <AppLayout title={t('dashboard.titre_auj')} noMobileHeader onRefresh={() => queryClient.invalidateQueries()}>

      {/* Hero violet — mobile uniquement */}
      <div className="bg-primary px-4 pt-safe pb-5 lg:hidden sticky top-0 z-20 rounded-b-3xl">
        <Greeting user={user} subtitle={dynamicSub} hero />
      </div>

      <div className="p-4 space-y-5 pb-safe">

        {/* Salutation desktop uniquement */}
        <div className="hidden lg:block">
          <Greeting user={user} subtitle={dynamicSub} />
        </div>

        {/* Onboarding checklist — visible uniquement si aucune commande */}
        <WelcomeChecklist
          user={user}
          atelier={atelier}
          clients={clients}
          commandes={commandes}
          isLoading={loadingCmd}
          navigate={navigate}
        />

        {/* Caisse du jour */}
        <CaisseCard stats={stats} isLoading={loadingStats} navigate={navigate} />

        {/* À faire aujourd'hui */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest mb-3">
            {t('dashboard.a_faire')}
          </h2>
          <TodoList commandes={commandes} isLoading={loadingCmd} navigate={navigate} />
        </div>

        {/* KPIs secondaires */}
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
          <div className="flex gap-3 pb-1">
            {loadingStats ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="shrink-0 w-28 h-16 rounded-xl" />)
            ) : (
              <>
                <KpiChip label={t('dashboard.kpi.en_attente')}        value={formatCurrency(totalRestant)} color="gold" />
                <KpiChip label={t('dashboard.kpi.commandes_actives')} value={activeCount}                  color="primary" />
                <KpiChip label={t('dashboard.kpi.nvx_clients')}       value={nouveauxClients}              color={nouveauxClients > 0 ? 'success' : 'default'} trend={tendanceClients !== 0 ? tendanceClients : null} />
                <KpiChip label={t('dashboard.kpi.livrees_mois')}      value={livreCeMois}                  color="success" />
                <KpiChip label={t('dashboard.kpi.en_retard')}         value={lateCount}                    color={lateCount > 0 ? 'danger' : 'default'} />
              </>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest mb-3">
            {t('dashboard.actions_rapides')}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionTile
              icon={Plus}
              label={t('dashboard.action.nouvelle_commande')}
              color="primary"
              onClick={() => navigate('/commandes/new')}
            />
            <QuickActionTile
              icon={UserPlus}
              label={t('dashboard.action.nouveau_client')}
              color="success"
              onClick={() => navigate('/clients')}
            />
            <QuickActionTile
              icon={Wallet}
              label={t('dashboard.action.paiement')}
              color="gold"
              onClick={() => navigate('/caisse')}
            />
          </div>
        </div>

        {/* Commandes récentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest">
              {t('dashboard.recentes')}
            </h2>
            <button
              type="button"
              onClick={() => navigate('/commandes')}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              {t('dashboard.tout_voir')} <ChevronRight size={14} />
            </button>
          </div>
          {loadingCmd ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : commandes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={t('dashboard.recentes_vide.titre')}
              description={t('dashboard.recentes_vide.description')}
              primaryAction={
                <Button onClick={() => navigate('/commandes/new')}>
                  {t('dashboard.recentes_vide.action')}
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {commandes.slice(0, 4).map(cmd => {
                const restant = (cmd.prix ?? 0) - (cmd.acompte ?? 0)
                const isLate  = cmd.statut === 'en_cours' && cmd.date_livraison_prevue && isPast(parseISO(cmd.date_livraison_prevue))
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => navigate(`/commandes/${cmd.id}`)}
                    className="w-full bg-card border border-edge rounded-2xl p-4 text-left hover:border-primary/30 active:opacity-70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{cmd.client_nom}</p>
                        <p className="text-xs text-ghost truncate">{cmd.vetement_nom}</p>
                      </div>
                      {cmd.date_livraison_prevue && (
                        <CountdownBadge dueDate={cmd.date_livraison_prevue} />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs', isLate ? 'text-danger font-medium' : 'text-ghost')}>
                        {cmd.date_livraison_prevue
                          ? new Date(cmd.date_livraison_prevue).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
                          : '—'}
                      </span>
                      <div className="text-right font-mono text-xs">
                        <span className="font-semibold text-ink">{formatCurrency(cmd.prix ?? 0)}</span>
                        {restant > 0 && <span className="ml-1 text-gold-dark">−{formatCurrency(restant)}</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
