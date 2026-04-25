import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { AppLayout } from '@/components/layout'
import { ClientCard, ClientForm } from '@/components/clients'
import { SearchBar, EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'

export default function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showSheet, setShowSheet] = useState(false)
  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const handleCreate = async data => {
    await createClient.mutateAsync(data)
    setShowSheet(false)
  }

  return (
    <AppLayout title="Clients">
      <div className="p-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un client…" />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'Aucun résultat' : 'Aucun client'}
            description={search ? 'Essayez un autre nom ou numéro' : 'Ajoutez votre premier client'}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => navigate(`/clients/${client.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton icon={Plus} onClick={() => setShowSheet(true)} />

      <BottomSheet isOpen={showSheet} onClose={() => setShowSheet(false)} title="Nouveau client">
        <ClientForm
          onSubmit={handleCreate}
          onCancel={() => setShowSheet(false)}
          isLoading={createClient.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}
