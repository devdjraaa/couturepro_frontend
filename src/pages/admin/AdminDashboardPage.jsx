import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin'
import { useAdminAuth } from '@/contexts'
import { useAdminAteliers } from '@/hooks/admin/useAteliers'
import { useAdminTickets } from '@/hooks/admin/useTickets'
import { useAdminPaiements } from '@/hooks/admin/useAdminPaiements'

function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:    'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const { admin } = useAdminAuth()
  const { data: ateliers } = useAdminAteliers()
  const { data: tickets } = useAdminTickets({ statut: 'ouvert' })
  const { data: paiements } = useAdminPaiements({ statut: 'pending' })

  const totalAteliers    = ateliers?.total ?? 0
  const ticketsOuverts   = tickets?.total ?? 0
  const paiementsPending = paiements?.total ?? 0

  const links = [
    ['/admin/ateliers',     t('admin.dashboard.link_ateliers')],
    ['/admin/tickets',      t('admin.dashboard.link_tickets')],
    ['/admin/paiements',    t('admin.dashboard.link_paiements')],
    ['/admin/transactions', t('admin.dashboard.link_transactions')],
  ]

  return (
    <AdminLayout title="Dashboard">
      <p className="text-sm text-gray-500 mb-6">
        {t('admin.dashboard.bonjour')} <span className="font-semibold text-gray-700">{admin?.prenom} {admin?.nom}</span>
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('admin.dashboard.ateliers')}         value={totalAteliers}    color="indigo" />
        <StatCard label={t('admin.dashboard.tickets_ouverts')}  value={ticketsOuverts}   color="yellow" />
        <StatCard label={t('admin.dashboard.paiements_attente')} value={paiementsPending} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-gray-700 mb-1">{t('admin.dashboard.acces_rapides')}</p>
          <div className="space-y-1 mt-3">
            {links.map(([href, label]) => (
              <a key={href} href={href} className="block text-sm text-indigo-600 hover:underline py-0.5">
                → {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
