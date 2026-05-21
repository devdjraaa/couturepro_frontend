import { useNavigate } from 'react-router-dom'
import { Plus, UserPlus, Wallet, ClipboardList, ChevronRight, AlertTriangle, Clock, CheckCircle2, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isToday, isPast, parseISO, differenceInCalendarDays, isThisMonth } from 'date-fns'
import { AppLayout } from '@/components/layout'
import { Skeleton, EmptyState, Button, CountdownBadge, MoneyAmount, QuickActionTile } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useCommandes, useCommandeStats } from '@/hooks/useCommandes'
import { useClients } from '@/hooks/useClients'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Salutation ───────────────────────────────────────────────────────────────
function Greeting({ user, subtitle }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateStr  = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="pt-4 pb-2">
      <p className="text-xs text-ghost capitalize mb-0.5">{dateStr}</p>
      <h1 className="text-xl font-bold font-display text-ink">
        {greeting}, {user?.prenom ?? user?.nom?.split(' ')[0] ?? ''} 👋
      </h1>
      {subtitle && (
        <p className="text-sm text-ghost mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// ── Caisse du jour ────────────────────────────────────────────────────────────
function CaisseCard({ stats, isLoading, navigate }) {
  const encaisse = stats?.total_encaisse ?? 0

  return (
    <div className="rounded-2xl bg-primary-700 p-4 text-inverse">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-inverse/70">Caisse du jour</p>
        <button
          type="button"
          onClick={() => navigate('/caisse')}
          className="flex items-center gap-1 text-xs text-inverse/70 hover:text-inverse transition-colors"
        >
          Voir le détail <ChevronRight size={12} />
        </button>
      </div>

      {isLoading ? (
        <div className="h-9 w-40 rounded-lg bg-inverse/10 animate-pulse mt-2" />
      ) : encaisse === 0 ? (
        <div className="mt-2">
          <p className="text-sm text-inverse/60">Vos premiers acomptes s'afficheront ici.</p>
          <button
            type="button"
            onClick={() => navigate('/caisse')}
            className="mt-2 text-xs font-medium text-inverse/90 underline underline-offset-2"
          >
            Enregistrer un paiement →
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <MoneyAmount value={encaisse} size="lg" className="text-inverse" />
          <p className="text-xs text-inverse/50 mt-1">Encaissé aujourd'hui</p>
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

    if (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) {
      const type = isPast(dateLiv) && !isToday(dateLiv) ? 'retard' : 'livraison'
      items.push({ type, label: `Livraison — ${cmd.vetement_nom ?? 'commande'}`, client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: type === 'retard' ? 0 : 1 })
    } else if (dateEss && isToday(dateEss)) {
      items.push({ type: 'essai', label: `Essayage — ${cmd.vetement_nom ?? 'commande'}`, client: cmd.client_nom, dueDate: cmd.date_essayage, to, priority: 1 })
    } else if (restant > 0 && dateLiv && differenceInCalendarDays(dateLiv, today) <= 3) {
      items.push({ type: 'solde', label: `Solde restant — ${formatCurrency(restant)}`, client: cmd.client_nom, dueDate: cmd.date_livraison_prevue, to, priority: 2 })
    }
  })

  items.sort((a, b) => a.priority - b.priority)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Journée libre 🎉"
        description="Pas d'urgence aujourd'hui. Prenez de l'avance sur vos commandes."
        primaryAction={
          <Button size="sm" variant="outline" onClick={() => navigate('/commandes')}>
            Voir toutes les commandes
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

// ── KPIs horizontaux ──────────────────────────────────────────────────────────
function KpiChip({ label, value, color = 'default' }) {
  const colors = {
    default: 'bg-card border-edge text-ink',
    gold:    'bg-gold-light border-gold/30 text-gold-dark',
    success: 'bg-success/8 border-success/20 text-success',
    primary: 'bg-primary-50 border-primary/20 text-primary-700',
    danger:  'bg-danger/8 border-danger/20 text-danger',
  }
  return (
    <div className={cn('shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border', colors[color])}>
      <span className="font-mono font-bold text-lg tabular-nums leading-tight">{value ?? '—'}</span>
      <span className="text-2xs font-medium mt-0.5 whitespace-nowrap opacity-70">{label}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { data: commandes = [], isLoading: loadingCmd } = useCommandes()
  const { data: stats,          isLoading: loadingStats } = useCommandeStats()
  const { data: clients = [] }  = useClients()

  const activeCount   = commandes.filter(c => c.statut === 'en_cours' || c.statut === 'essai').length
  const livreCeMois   = commandes.filter(c => c.statut === 'livre' && c.date_livraison_prevue && isThisMonth(parseISO(c.date_livraison_prevue))).length
  const totalRestant  = stats?.total_restant ?? 0
  const lateCount     = stats?.en_retard ?? 0
  const urgentToday   = commandes.filter(c => {
    if (c.statut === 'livre' || c.statut === 'annule') return false
    const dateLiv = c.date_livraison_prevue ? parseISO(c.date_livraison_prevue) : null
    const dateEss = c.date_essayage ? parseISO(c.date_essayage) : null
    return (dateLiv && (isPast(dateLiv) || isToday(dateLiv))) || (dateEss && isToday(dateEss))
  }).length

  const dynamicSub = urgentToday > 0
    ? `${urgentToday} action${urgentToday > 1 ? 's' : ''} urgente${urgentToday > 1 ? 's' : ''} aujourd'hui`
    : activeCount > 0 ? `${activeCount} commande${activeCount > 1 ? 's' : ''} en cours` : null

  return (
    <AppLayout title="Aujourd'hui" noMobileHeader>
      <div className="p-4 space-y-5 pb-safe">

        {/* Salutation */}
        <Greeting user={user} subtitle={dynamicSub} />

        {/* Caisse du jour */}
        <CaisseCard stats={stats} isLoading={loadingStats} navigate={navigate} />

        {/* À faire aujourd'hui */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest mb-3">
            À faire aujourd'hui
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
                <KpiChip label="En attente paiement" value={formatCurrency(totalRestant)} color="gold" />
                <KpiChip label="Commandes actives"   value={activeCount}                   color="primary" />
                <KpiChip label="Livrées ce mois"     value={livreCeMois}                   color="success" />
                <KpiChip label="En retard"           value={lateCount}                     color={lateCount > 0 ? 'danger' : 'default'} />
              </>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest mb-3">
            Actions rapides
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionTile
              icon={Plus}
              label="Nouvelle commande"
              color="primary"
              onClick={() => navigate('/commandes/new')}
            />
            <QuickActionTile
              icon={UserPlus}
              label="Nouveau client"
              color="success"
              onClick={() => navigate('/clients')}
            />
            <QuickActionTile
              icon={Wallet}
              label="Encaisser"
              color="gold"
              onClick={() => navigate('/caisse')}
            />
          </div>
        </div>

        {/* Commandes récentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ghost uppercase tracking-widest">
              Commandes récentes
            </h2>
            <button
              type="button"
              onClick={() => navigate('/commandes')}
              className="flex items-center gap-0.5 text-xs font-medium text-primary"
            >
              Tout voir <ChevronRight size={14} />
            </button>
          </div>
          {loadingCmd ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : commandes.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Pas encore de commandes"
              description="Créez votre première commande pour commencer à suivre vos délais et paiements."
              primaryAction={
                <Button onClick={() => navigate('/commandes/new')}>
                  Créer une commande
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
