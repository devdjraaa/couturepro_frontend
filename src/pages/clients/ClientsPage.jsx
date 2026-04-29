import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { AppLayout } from '@/components/layout'
import { ClientCard, ClientForm } from '@/components/clients'
import { SearchBar, EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'
import { saveClientPhoto, deleteClientPhoto } from '@/utils/clientPhotoStorage'

export default function ClientsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [showSheet, setShowSheet] = useState(false)
  const { data: clients = [], isLoading } = useClients()
  const createClient = useCreateClient()

  const filtered = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const [doublonError, setDoublonError] = useState(null)

  const handleCreate = async ({ _photo, ...data }) => {
    setDoublonError(null)
    try {
      const client = await createClient.mutateAsync(data)
      if (_photo === '__remove__') deleteClientPhoto(client.id)
      else if (_photo) saveClientPhoto(client.id, _photo)
      setShowSheet(false)
    } catch (err) {
      if (err.code === 'doublon') setDoublonError(err.message)
      else throw err
    }
  }

  return (
    <AppLayout title={t('clients.titre')}>
      <div className="p-4 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder={t('clients.recherche_placeholder')} />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? t('commun.aucun_resultat') : t('clients.vide.titre')}
            description={search ? '' : t('clients.vide.description')}
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

      <BottomSheet
        isOpen={showSheet}
        onClose={() => { setShowSheet(false); setDoublonError(null) }}
        title={t('clients.formulaire.titre_ajout')}
      >
        {doublonError && (
          <p className="mx-5 mt-3 text-sm text-danger bg-danger/8 rounded-xl px-4 py-2.5">
            {doublonError}
          </p>
        )}
        <ClientForm
          onSubmit={handleCreate}
          onCancel={() => { setShowSheet(false); setDoublonError(null) }}
          isLoading={createClient.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}
