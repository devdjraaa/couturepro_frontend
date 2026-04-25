import { useState } from 'react'
import { Plus, Scissors } from 'lucide-react'
import { useVetements, useCreateVetement, useUpdateVetement, useDeleteVetement } from '@/hooks/useVetements'
import { AppLayout } from '@/components/layout'
import { VetementCard, VetementForm } from '@/components/vetements'
import { EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'

export default function CataloguePage() {
  const [editing, setEditing] = useState(null) // null | 'new' | vetement object
  const { data: vetements = [], isLoading } = useVetements()
  const createVetement = useCreateVetement()
  const updateVetement = useUpdateVetement()
  const deleteVetement = useDeleteVetement()

  const isNew = editing === 'new'
  const isLoading_ = createVetement.isPending || updateVetement.isPending

  const handleSubmit = async data => {
    if (isNew) await createVetement.mutateAsync(data)
    else await updateVetement.mutateAsync({ id: editing.id, ...data })
    setEditing(null)
  }

  const handleDelete = async vetementId => {
    if (!confirm('Supprimer ce vêtement du catalogue ?')) return
    await deleteVetement.mutateAsync(vetementId)
  }

  return (
    <AppLayout title="Catalogue">
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : vetements.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Catalogue vide"
            description="Ajoutez les modèles de vêtements que vous confectionnez"
          />
        ) : (
          <div className="space-y-2">
            {vetements.map(v => (
              <VetementCard
                key={v.id}
                vetement={v}
                onEdit={vet => setEditing(vet)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton icon={Plus} onClick={() => setEditing('new')} />

      <BottomSheet
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={isNew ? 'Nouveau vêtement' : 'Modifier le vêtement'}
      >
        <VetementForm
          initialData={isNew ? undefined : editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          isLoading={isLoading_}
        />
      </BottomSheet>
    </AppLayout>
  )
}
