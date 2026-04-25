import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, ClipboardList } from 'lucide-react'
import { useCommandes, useCreateCommande } from '@/hooks/useCommandes'
import { AppLayout } from '@/components/layout'
import { CommandeCard, CommandeForm } from '@/components/commandes'
import { TabBar, EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'

const STATUT_TABS = [
  { key: 'tous',     label: 'Tous'     },
  { key: 'en_cours', label: 'En cours' },
  { key: 'essai',    label: 'Essai'    },
  { key: 'livre',    label: 'Livré'    },
  { key: 'annule',   label: 'Annulé'   },
]

export default function CommandesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('tous')
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    if (location.pathname === '/commandes/new') setShowSheet(true)
  }, [location.pathname])
  const { data: commandes = [], isLoading } = useCommandes()
  const createCommande = useCreateCommande()

  const filtered = activeTab === 'tous'
    ? commandes
    : commandes.filter(c => c.statut === activeTab)

  const tabsWithCounts = STATUT_TABS.map(t => ({
    ...t,
    count: t.key === 'tous'
      ? undefined
      : (commandes.filter(c => c.statut === t.key).length || undefined),
  }))

  const handleCloseSheet = () => {
    setShowSheet(false)
    if (location.pathname === '/commandes/new') navigate('/commandes', { replace: true })
  }

  const handleCreate = async data => {
    const cmd = await createCommande.mutateAsync(data)
    setShowSheet(false)
    navigate(`/commandes/${cmd.id}`)
  }

  return (
    <AppLayout title="Commandes">
      <TabBar tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />

      <div className="p-4 space-y-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucune commande"
            description={
              activeTab === 'tous'
                ? 'Créez votre première commande'
                : 'Aucune commande dans ce statut'
            }
          />
        ) : (
          filtered.map(cmd => (
            <CommandeCard
              key={cmd.id}
              commande={cmd}
              onClick={() => navigate(`/commandes/${cmd.id}`)}
            />
          ))
        )}
      </div>

      <FloatingActionButton icon={Plus} onClick={() => setShowSheet(true)} />

      <BottomSheet isOpen={showSheet} onClose={handleCloseSheet} title="Nouvelle commande">
        <CommandeForm
          onSubmit={handleCreate}
          onCancel={handleCloseSheet}
          isLoading={createCommande.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}
