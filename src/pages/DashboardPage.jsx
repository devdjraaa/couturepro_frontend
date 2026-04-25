import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { StatsGrid, RecentCommandes } from '@/components/dashboard'
import { FloatingActionButton } from '@/components/ui'

export default function DashboardPage() {
  const navigate = useNavigate()
  return (
    <AppLayout title="Accueil">
      <div className="p-4 space-y-6">
        <StatsGrid />
        <div>
          <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">
            Commandes récentes
          </h2>
          <RecentCommandes />
        </div>
      </div>
      <FloatingActionButton
        icon={Plus}
        onClick={() => navigate('/commandes/new')}
      />
    </AppLayout>
  )
}
