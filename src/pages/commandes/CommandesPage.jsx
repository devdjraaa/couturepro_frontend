import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Plus, ClipboardList, X, AlertTriangle, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommandes, useCreateCommande } from '@/hooks/useCommandes'
import { useCommunications } from '@/hooks/useParametres'
import { whatsappService } from '@/services/whatsappService'
import { AppLayout } from '@/components/layout'
import { CommandeCard, CommandeForm } from '@/components/commandes'
import { TabBar, EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'

export default function CommandesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('tous')
  const [showSheet, setShowSheet] = useState(false)

  const alerte = searchParams.get('alerte') // 'retard' | '48h' | null

  useEffect(() => {
    if (location.pathname === '/commandes/new') setShowSheet(true)
  }, [location.pathname])

  const { data: commandes = [], isLoading } = useCommandes()
  const createCommande = useCreateCommande()
  const { data: commsConfig } = useCommunications()

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

  const STATUT_TABS = [
    { key: 'tous',     label: t('commandes.onglets.toutes')   },
    { key: 'en_cours', label: t('commandes.statut.en_cours')  },
    { key: 'livre',    label: t('commandes.statut.livre')     },
    { key: 'annule',   label: t('commandes.statut.annule')    },
  ]

  const tabsWithCounts = STATUT_TABS.map(tab => ({
    ...tab,
    count: tab.key === 'tous'
      ? undefined
      : (commandes.filter(c => c.statut === tab.key).length || undefined),
  }))

  const handleCloseSheet = () => {
    setShowSheet(false)
    if (location.pathname === '/commandes/new') navigate('/commandes', { replace: true })
  }

  const handleCreate = async data => {
    const cmd = await createCommande.mutateAsync(data)
    setShowSheet(false)
    if (commsConfig?.whatsapp_enabled && commsConfig?.confirmation_commande && cmd?.id) {
      whatsappService.getConfirmationCommande(cmd.id)
        .then(({ lien }) => window.open(lien, '_blank', 'noopener,noreferrer'))
        .catch(() => {})
    }
    navigate(`/commandes/${cmd.id}`)
  }

  const clearAlerte = () => setSearchParams({})

  return (
    <AppLayout title={t('commandes.titre')}>
      {!alerte && <TabBar tabs={tabsWithCounts} activeTab={activeTab} onChange={setActiveTab} />}

      {alerte && (
        <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b border-edge ${alerte === 'retard' ? 'bg-danger/8 text-danger' : 'bg-warning/8 text-warning'}`}>
          {alerte === 'retard'
            ? <AlertTriangle size={15} />
            : <Timer size={15} />
          }
          <span className="flex-1">
            {alerte === 'retard' ? t('commandes.indicateurs.en_retard') : t('commandes.indicateurs.dans_48h')}
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
            title={t('commandes.vide.titre')}
            description={
              alerte === 'retard' ? t('commandes.indicateurs.en_retard')
              : alerte === '48h'  ? t('commandes.indicateurs.dans_48h')
              : t('commandes.vide.description')
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

      <BottomSheet isOpen={showSheet} onClose={handleCloseSheet} title={t('commandes.formulaire.titre_ajout')}>
        <CommandeForm
          onSubmit={handleCreate}
          onCancel={handleCloseSheet}
          isLoading={createCommande.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}
