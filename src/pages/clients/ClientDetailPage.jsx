import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Edit2, Trash2, ClipboardList, MessageCircle } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient, useToggleVip } from '@/hooks/useClients'
import { useMesures, useSaveMesures } from '@/hooks/useMesures'
import { useCommandes } from '@/hooks/useCommandes'
import { useWhatsappRappel } from '@/hooks/useWhatsapp'
import { useAuth } from '@/contexts'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { AppLayout } from '@/components/layout'
import { ClientForm } from '@/components/clients'
import { MesureForm, MesureDisplay } from '@/components/mesures'
import { CommandeCard } from '@/components/commandes'
import { TabBar, Badge, Button, BottomSheet, Skeleton, EmptyState } from '@/components/ui'
import { ClientAvatar } from '@/components/clients'
import { saveClientPhoto, deleteClientPhoto } from '@/utils/clientPhotoStorage'
import { formatDate } from '@/utils/formatDate'

const TABS = [
  { key: 'infos',     label: 'Infos'     },
  { key: 'mesures',   label: 'Mesures'   },
  { key: 'commandes', label: 'Commandes' },
]

export default function ClientDetailPage() {
  const { id } = useParams()
  const { atelier } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const clientId = id
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'infos')
  const [showEdit, setShowEdit] = useState(false)
  const [editingMesures, setEditingMesures] = useState(false)

  const { data: client, isLoading } = useClient(clientId)
  const { data: mesure } = useMesures(clientId)
  const { data: allCommandes = [] } = useCommandes()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const toggleVip = useToggleVip()
  const saveMesures = useSaveMesures(clientId)
  const whatsappRappel = useWhatsappRappel()
  const { available: whatsappAvailable } = usePlanFeature('facture_whatsapp')

  const clientCommandes = allCommandes.filter(c => c.client_id === clientId)

  const handleUpdate = async ({ _photo, ...data }) => {
    await updateClient.mutateAsync({ id: clientId, ...data })
    if (_photo === '__remove__') deleteClientPhoto(clientId)
    else if (_photo) saveClientPhoto(clientId, _photo)
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

  const isVip = !!client.is_vip

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
        <ClientAvatar client={client} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-ink truncate">{client.prenom} {client.nom}</h1>
            {isVip && <Badge color="accent" size="sm">VIP</Badge>}
          </div>
          {client.telephone && <p className="text-sm text-dim">{client.telephone}</p>}
          <p className="text-xs text-ghost mt-0.5">Client depuis {formatDate(client.created_at)}</p>
        </div>
        <button
          onClick={() => toggleVip.mutate(client.id)}
          className="text-xs text-dim underline shrink-0"
        >
          {isVip ? 'Retirer VIP' : '→ VIP'}
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
                <span className="text-sm text-dim">Type</span>
                <span className="text-sm text-ink font-medium capitalize">{client.type_profil ?? '—'}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-dim">Commandes</span>
                <span className="text-sm text-ink font-medium">{client.commandes_count ?? clientCommandes.length}</span>
              </div>
              {client.notes && (
                <div className="px-4 py-3">
                  <p className="text-xs text-dim mb-1">Notes</p>
                  <p className="text-sm text-ink">{client.notes}</p>
                </div>
              )}
            </div>
            {client.telephone && whatsappAvailable && (
              <Button
                variant="secondary"
                icon={MessageCircle}
                className="w-full"
                loading={whatsappRappel.isPending}
                onClick={() => whatsappRappel.mutate(client.id)}
              >
                Rappeler sur WhatsApp
              </Button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-danger text-sm py-2"
            >
              <Trash2 size={16} /> Supprimer ce client
            </button>
          </div>
        )}

        {activeTab === 'mesures' && (
          <div className="space-y-4">
            {editingMesures ? (
              <div>
                <MesureForm
                  initialData={mesure?.champs}
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
            ) : mesure ? (
              <div>
                <MesureDisplay
                  mesures={mesure.champs}
                  clientNom={`${client.prenom ?? ''} ${client.nom}`.trim()}
                  atelierNom={atelier?.nom}
                />
                <Button variant="secondary" className="mt-4 w-full" onClick={() => setEditingMesures(true)}>
                  Modifier les mesures
                </Button>
              </div>
            ) : (
              <EmptyState
                title="Aucune mesure"
                description="Enregistrez les mesures corporelles de ce client"
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
