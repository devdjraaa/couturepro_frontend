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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconColor, trend }) {
  let badge
  if (trend === undefined) {
    badge = (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500">
        ↓ Action req.
      </span>
    )
  } else if (trend === null) {
    badge = (
      <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
        <Minus size={10} /> —
      </span>
    )
  } else if (trend >= 0) {
    badge = (
      <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">
        <ArrowUpRight size={11} /> +{trend}%
      </span>
    )
  } else {
    badge = (
      <span className="flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
        <ArrowDownRight size={11} /> {trend}%
      </span>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconColor)}>
          <Icon size={18} />
        </div>
        {badge}
      </div>
      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Activity item ─────────────────────────────────────────────────────────────
function ActivityItem({ icon: Icon, iconColor, title, subtitle, time }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', iconColor)}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{time}</span>
    </div>
  )
}

// ── Quick access item ─────────────────────────────────────────────────────────
function QuickItem({ icon: Icon, iconColor, title, subtitle, to }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 w-full py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-1 px-1 rounded-lg transition-colors text-left"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconColor)}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <ChevronRight size={15} className="text-gray-400 shrink-0" />
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
      icon: Building2,
      iconColor: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600',
      title: 'Gérer les ateliers',
      subtitle: `${totalAteliers} ateliers actifs`,
      to: '/admin/ateliers',
    },
    {
      icon: CreditCard,
      iconColor: 'bg-red-50 dark:bg-red-900/30 text-red-500',
      title: 'Valider les paiements',
      subtitle: `${paiementsPending} en attente`,
      to: '/admin/paiements',
    },
    {
      icon: TicketCheck,
      iconColor: 'bg-amber-50 dark:bg-amber-900/30 text-amber-500',
      title: 'Voir les tickets',
      subtitle: `${ticketsOuverts} ouvert${ticketsOuverts !== 1 ? 's' : ''}`,
      to: '/admin/tickets',
    },
    {
      icon: KeyRound,
      iconColor: 'bg-green-50 dark:bg-green-900/30 text-green-600',
      title: "Créer un code d'accès",
      subtitle: 'Génération rapide',
      to: '/admin/ateliers',
    },
  ]

  return (
    <AdminLayout title="Dashboard">
      {/* Greeting */}
      <p className="text-sm text-gray-500 mb-6">
        {greeting},{' '}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {admin?.prenom} {admin?.nom}
        </span>
        {' '}
        <span className="text-gray-400">— Voici un aperçu de l'activité aujourd'hui</span>
      </p>

      {/* 4-column stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Ateliers"
          value={totalAteliers}
          sub={`${totalAteliers} actifs ce mois`}
          icon={Building2}
          iconColor="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
          trend={12}
        />
        <StatCard
          label="Tickets ouverts"
          value={ticketsOuverts}
          sub={ticketsOuverts === 0 ? 'Aucun en attente' : `${ticketsOuverts} en attente`}
          icon={TicketCheck}
          iconColor="bg-amber-50 dark:bg-amber-900/30 text-amber-500"
          trend={null}
        />
        <StatCard
          label="Paiements en attente"
          value={paiementsPending}
          sub="À valider"
          icon={CreditCard}
          iconColor="bg-red-50 dark:bg-red-900/30 text-red-500"
        />
        <StatCard
          label="Transactions du jour"
          value={0}
          sub="Aucune aujourd'hui"
          icon={CreditCard}
          iconColor="bg-green-50 dark:bg-green-900/30 text-green-600"
          trend={0}
        />
      </div>

      {/* Activity + Quick access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Activité récente */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Activité récente</p>
            <a
              href="/admin/audit"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Voir tout →
            </a>
          </div>
          <ActivityItem
            icon={CreditCard}
            iconColor="bg-red-50 text-red-500"
            title="Paiement en attente de validation"
            subtitle="Atelier Konaté · 45 000 XOF"
            time="il y a 5 min"
          />
          <ActivityItem
            icon={Building2}
            iconColor="bg-indigo-50 text-indigo-600"
            title="Nouvel atelier inscrit"
            subtitle="Atelier Diabaté · Plan Premium"
            time="il y a 1 h"
          />
          <ActivityItem
            icon={CheckCircle}
            iconColor="bg-green-50 text-green-600"
            title="Code d'accès créé"
            subtitle="Pour Atelier Sangaré"
            time="il y a 3 h"
          />
          <ActivityItem
            icon={TicketCheck}
            iconColor="bg-amber-50 text-amber-500"
            title="Ticket #1247 résolu"
            subtitle="Problème de connexion"
            time="il y a 5 h"
          />
        </div>

        {/* Accès rapides */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Accès rapides</p>
          {QUICK_LINKS.map(item => (
            <QuickItem key={item.to + item.title} {...item} />
          ))}
        </div>
      </div>

      {/* État du système */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">État du système</p>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Tout fonctionne
          </span>
        </div>
        {SYSTEM_ITEMS.map(({ label, status }) => (
          <div
            key={label}
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{status}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
