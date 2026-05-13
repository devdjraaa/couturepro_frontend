import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommandes } from '@/hooks/useCommandes'
import { CommandeCard } from '@/components/commandes'
import { Skeleton, EmptyState } from '@/components/ui'

export default function RecentCommandes() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: commandes = [], isLoading } = useCommandes()
  const recent = commandes.slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    )
  }

  if (!recent.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={t('dashboard.vide.titre')}
        description={t('dashboard.vide.description')}
      />
    )
  }

  return (
    <div className="space-y-2">
      {recent.map(cmd => (
        <CommandeCard
          key={cmd.id}
          commande={cmd}
          onClick={() => navigate(`/commandes/${cmd.id}`)}
        />
      ))}
    </div>
  )
}
