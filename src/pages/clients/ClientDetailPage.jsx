import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Edit2, Trash2, ClipboardList, MessageCircle } from 'lucide-react'
import { useClient, useUpdateClient, useDeleteClient, useToggleVip } from '@/hooks/useClients'
import { useMesures, useSaveMesures } from '@/hooks/useMesures'
import { useCommandes } from '@/hooks/useCommandes'
import { useVetements } from '@/hooks/useVetements'
import { useWhatsappRappel } from '@/hooks/useWhatsapp'
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
  const location = useLocation()
  const clientId = id
  const [activeTab, setActiveTab] = useState(location.state?.tab ?? 'infos')
  const [showEdit, setShowEdit] = useState(false)
  const [editingMesures, setEditingMesures] = useState(false)
  const [selectedVetementId, setSelectedVetementId] = useState(null)

  const { data: client, isLoading } = useClient(clientId)
  const { data: mesures = [] } = useMesures(clientId)
  const { data: allCommandes = [] } = useCommandes()
  const { data: vetements = [] } = useVetements()
  const updateClient = useUpdateClient()
  const deleteClient = useDeleteClient()
  const toggleVip = useToggleVip()
  const saveMesures = useSaveMesures(clientId, selectedVetementId)
  const whatsappRappel = useWhatsappRappel()

  const clientCommandes = allCommandes.filter(c => c.client_id === clientId)
  const selectedMesure    = mesures.find(m => m.vetement_id === selectedVetementId)
  const selectedVetement  = vetements.find(v => v.id === selectedVetementId)
  const libelles          = selectedVetement?.libelles_mesures ?? []

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

  const handleSelectVetement = vetementId => {
    setSelectedVetementId(vetementId || null)
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

  const isVip = client.type_profil === 'vip'

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
                <span className="text-sm text-dim">Type de profil</span>
                <span className="text-sm text-ink font-medium capitalize">{client.type_profil}</span>
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
            {client.telephone && (
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
            <select
              value={selectedVetementId ?? ''}
              onChange={e => handleSelectVetement(e.target.value)}
              className="w-full border border-edge rounded-xl px-3 py-2 text-sm bg-card text-ink"
            >
              <option value="">Choisir un vêtement…</option>
              {vetements.map(v => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>

            {selectedVetementId && (
              editingMesures ? (
                <div>
                  <MesureForm
                    libelles={libelles}
                    initialData={selectedMesure?.champs}
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
              ) : selectedMesure ? (
                <div>
                  <MesureDisplay libelles={libelles} mesures={selectedMesure.champs} />
                  <Button variant="secondary" className="mt-4 w-full" onClick={() => setEditingMesures(true)}>
                    Modifier les mesures
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="Aucune mesure"
                  description="Enregistrez les mesures de ce client pour ce vêtement"
                  action={<Button onClick={() => setEditingMesures(true)}>Ajouter les mesures</Button>}
                />
              )
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
