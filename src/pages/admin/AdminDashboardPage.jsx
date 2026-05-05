import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Building2, TicketCheck, CreditCard, CheckCircle, KeyRound,
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

// ── Activity item ─────────────────────────────────────────────────────────────
function ActivityItem({ icon: Icon, color = 'primary', title, subtitle, time }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-edge last:border-0">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', ICON_COLORS[color])}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{title}</p>
        <p className="text-xs text-ghost truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-ghost shrink-0 whitespace-nowrap">{time}</span>
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

// ── System status ─────────────────────────────────────────────────────────────
const SYSTEM_ITEMS = [
  { label: 'Base de données',       status: 'Opérationnelle' },
  { label: 'API Paiements',         status: 'Opérationnelle' },
  { label: 'Service notifications', status: 'Opérationnel'   },
]

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
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const QUICK_LINKS = [
    {
      icon: Building2, color: 'primary',
      title: 'Gérer les ateliers',
      subtitle: `${totalAteliers} ateliers actifs`,
      to: '/admin/ateliers',
    },
    {
      icon: CreditCard, color: 'danger',
      title: 'Valider les paiements',
      subtitle: `${paiementsPending} en attente`,
      to: '/admin/paiements',
    },
    {
      icon: TicketCheck, color: 'accent',
      title: 'Voir les tickets',
      subtitle: `${ticketsOuverts} ouvert${ticketsOuverts !== 1 ? 's' : ''}`,
      to: '/admin/tickets',
    },
    {
      icon: KeyRound, color: 'success',
      title: "Créer un code d'accès",
      subtitle: 'Génération rapide',
      to: '/admin/ateliers',
    },
  ]

  return (
    <AdminLayout title="Dashboard">
      {/* Greeting */}
      <p className="text-sm text-ghost mb-6">
        {greeting},{' '}
        <span className="font-semibold text-ink">{admin?.prenom} {admin?.nom}</span>
        {' '}
        <span className="text-ghost">— Voici un aperçu de l'activité aujourd'hui</span>
      </p>

      {/* 4-column stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ateliers"
          value={totalAteliers}
          sub={`${totalAteliers} actifs ce mois`}
          icon={Building2}
          color="primary"
          trend={12}
        />
        <StatCard
          label="Tickets ouverts"
          value={ticketsOuverts}
          sub={ticketsOuverts === 0 ? 'Aucun en attente' : `${ticketsOuverts} en attente`}
          icon={TicketCheck}
          color="accent"
          trend={null}
        />
        <StatCard
          label="Paiements en attente"
          value={paiementsPending}
          sub="À valider"
          icon={CreditCard}
          color="danger"
        />
        <StatCard
          label="Transactions du jour"
          value={0}
          sub="Aucune aujourd'hui"
          icon={CreditCard}
          color="success"
          trend={0}
        />
      </div>

      {/* Activity + Quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-card border border-edge rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">Activité récente</p>
            <a href="/admin/audit" className="text-xs font-medium text-primary hover:text-primary-600 transition-colors">
              Voir tout →
            </a>
          </div>
          <ActivityItem icon={CreditCard}  color="danger"  title="Paiement en attente de validation" subtitle="Atelier Konaté · 45 000 XOF"  time="il y a 5 min" />
          <ActivityItem icon={Building2}   color="primary" title="Nouvel atelier inscrit"             subtitle="Atelier Diabaté · Plan Premium" time="il y a 1 h"   />
          <ActivityItem icon={CheckCircle} color="success" title="Code d'accès créé"                 subtitle="Pour Atelier Sangaré"           time="il y a 3 h"   />
          <ActivityItem icon={TicketCheck} color="accent"  title="Ticket #1247 résolu"               subtitle="Problème de connexion"          time="il y a 5 h"   />
        </div>

        {/* Accès rapides */}
        <div className="bg-card border border-edge rounded-xl p-5">
          <p className="text-sm font-semibold text-ink mb-2">Accès rapides</p>
          {QUICK_LINKS.map(item => (
            <QuickItem key={item.to + item.title} {...item} />
          ))}
        </div>
      </div>

      {/* État du système */}
      <div className="bg-card border border-edge rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-ink">État du système</p>
          <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Tout fonctionne
          </span>
        </div>
        {SYSTEM_ITEMS.map(({ label, status }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-edge last:border-0">
            <span className="text-sm text-ghost">{label}</span>
            <span className="text-sm text-ink font-medium">{status}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
