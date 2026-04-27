import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Plus, ClipboardList, X, AlertTriangle, Timer } from 'lucide-react'
import { useCommandes, useCreateCommande } from '@/hooks/useCommandes'
import { AppLayout } from '@/components/layout'
import { CommandeCard, CommandeForm } from '@/components/commandes'
import { TabBar, EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'

const STATUT_TABS = [
  { key: 'tous',     label: 'Tous'     },
  { key: 'en_cours', label: 'En cours' },
  { key: 'livre',    label: 'Livré'    },
  { key: 'annule',   label: 'Annulé'   },
]

export default function CommandesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('tous')
  const [showSheet, setShowSheet] = useState(false)

  const alerte = searchParams.get('alerte') // 'retard' | '48h' | null

  useEffect(() => {
    if (location.pathname === '/commandes/new') setShowSheet(true)
  }, [location.pathname])

  const { data: commandes = [], isLoading } = useCommandes()
  const createCommande = useCreateCommande()

  const filtered = useMemo(() => {
    const now = Date.now()
    const h48 = now + 48 * 60 * 60 * 1000

    if (alerte === 'retard') {
      return commandes.filter(c =>
        c.statut === 'en_cours' &&
        c.date_livraison_prevue &&
        new Date(c.date_livraison_prevue).getTime() < now,
      )
    }
    if (alerte === '48h') {
      return commandes.filter(c => {
        if (!['en_cours'].includes(c.statut) || !c.date_livraison_prevue) return false
        const t = new Date(c.date_livraison_prevue).getTime()
        return t >= now && t <= h48
      })
    }
    return activeTab === 'tous' ? commandes : commandes.filter(c => c.statut === activeTab)
  }, [commandes, activeTab, alerte])

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

  const clearAlerte = () => setSearchParams({})

  return (
    <AppLayout title="Commandes">
      {!alerte && <TabBar tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />}

      {alerte && (
        <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b border-edge ${alerte === 'retard' ? 'bg-danger/8 text-danger' : 'bg-warning/8 text-warning'}`}>
          {alerte === 'retard'
            ? <AlertTriangle size={15} />
            : <Timer size={15} />
          }
          <span className="flex-1">
            {alerte === 'retard' ? 'Commandes en retard' : 'Livraisons dans 48h'}
          </span>
          <button type="button" onClick={clearAlerte} className="opacity-60 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="p-4 space-y-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Aucune commande"
            description={
              alerte === 'retard' ? 'Aucune commande en retard'
              : alerte === '48h'  ? 'Aucune livraison dans les 48h'
              : activeTab === 'tous' ? 'Créez votre première commande'
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
