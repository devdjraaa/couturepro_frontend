import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit2, Trash2, ClipboardList } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient, useToggleVip } from '@/hooks/useClients'
import { useMesures, useSaveMesures } from '@/hooks/useMesures'
import { useCommandes } from '@/hooks/useCommandes'
import { AppLayout } from '@/components/layout'
import { ClientForm } from '@/components/clients'
import { MesureForm, MesureDisplay } from '@/components/mesures'
import { CommandeCard } from '@/components/commandes'
import { TabBar, Avatar, Badge, Button, BottomSheet, Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

const TABS = [
  { key: 'infos',     label: 'Infos'     },
  { key: 'mesures',   label: 'Mesures'   },
  { key: 'commandes', label: 'Commandes' },
]

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clientId = Number(id)
  const [activeTab, setActiveTab] = useState('infos')
  const [showEdit, setShowEdit] = useState(false)
  const [editingMesures, setEditingMesures] = useState(false)

  const { data: client, isLoading } = useClient(clientId)
  const { data: mesures } = useMesures(clientId)
  const { data: allCommandes = [] } = useCommandes()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const toggleVip = useToggleVip()
  const saveMesures = useSaveMesures(clientId)

  const clientCommandes = allCommandes.filter(c => c.client_id === clientId)

  const handleUpdate = async data => {
    await updateClient.mutateAsync({ id: clientId, ...data })
    setShowEdit(false)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer ce client et toutes ses données ?')) return
    await deleteClient.mutateAsync(clientId)
    navigate('/clients', { replace: true })
  }

  const handleSaveMesures = async data => {
    await saveMesures.mutateAsync(data)
    setEditingMesures(false)
  }

  if (isLoading) {
    return (
      <AppLayout showBack title="Client">
        <div className="p-4 space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!client) return null

  return (
    <AppLayout
      showBack
      title={client.nom}
      rightAction={
        <button onClick={() => setShowEdit(true)} className="p-2 text-dim">
          <Edit2 size={18} />
        </button>
      }
    >
      {/* Header */}
      <div className="bg-card border-b border-edge px-4 py-4 flex items-center gap-4">
        <Avatar name={client.nom} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-ink truncate">{client.nom}</h1>
            {client.profil === 'vip' && <Badge color="accent" size="sm">VIP</Badge>}
          </div>
          {client.telephone && <p className="text-sm text-dim">{client.telephone}</p>}
          <p className="text-xs text-ghost mt-0.5">Client depuis {formatDate(client.created_at)}</p>
        </div>
        <button
          onClick={() => toggleVip.mutate(client.id)}
          className="text-xs text-dim underline shrink-0"
        >
          {client.profil === 'vip' ? 'Retirer VIP' : '→ VIP'}
        </button>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="p-4">
        {activeTab === 'infos' && (
          <div className="space-y-3">
            <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
              {client.telephone && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-dim">Téléphone</span>
                  <span className="text-sm text-ink font-medium">{client.telephone}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-dim">Commandes</span>
                <span className="text-sm text-ink font-medium">{client.commandes_count ?? 0}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-dim">Points fidélité</span>
                <span className="text-sm text-ink font-medium">{client.points ?? 0} pts</span>
              </div>
              {client.notes && (
                <div className="px-4 py-3">
                  <p className="text-xs text-dim mb-1">Notes</p>
                  <p className="text-sm text-ink">{client.notes}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-danger text-sm py-2"
            >
              <Trash2 size={16} /> Supprimer ce client
            </button>
          </div>
        )}

        {activeTab === 'mesures' && (
          <div>
            {editingMesures ? (
              <div>
                <MesureForm
                  initialData={mesures}
                  onSubmit={handleSaveMesures}
                  isLoading={saveMesures.isPending}
                />
                <button
                  onClick={() => setEditingMesures(false)}
                  className="w-full text-sm text-dim py-2 mt-2"
                >
                  Annuler
                </button>
              </div>
            ) : mesures ? (
              <div>
                <MesureDisplay mesures={mesures} />
                <Button variant="secondary" className="mt-4 w-full" onClick={() => setEditingMesures(true)}>
                  Modifier les mesures
                </Button>
              </div>
            ) : (
              <EmptyState
                title="Aucune mesure"
                description="Enregistrez les mesures de ce client"
                action={<Button onClick={() => setEditingMesures(true)}>Ajouter les mesures</Button>}
              />
            )}
          </div>
        )}

        {activeTab === 'commandes' && (
          <div className="space-y-2">
            {clientCommandes.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Aucune commande"
                description="Ce client n'a pas encore de commande"
                action={
                  <Button onClick={() => navigate('/commandes/new')}>
                    Nouvelle commande
                  </Button>
                }
              />
            ) : (
              clientCommandes.map(cmd => (
                <CommandeCard
                  key={cmd.id}
                  commande={cmd}
                  onClick={() => navigate(`/commandes/${cmd.id}`)}
                />
              ))
            )}
          </div>
        )}
      </div>

      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le client">
        <ClientForm
          initialData={client}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={updateClient.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}
