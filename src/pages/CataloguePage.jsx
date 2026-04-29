import { useState } from 'react'
import { Plus, Scissors, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useVetements, useCreateVetement, useUpdateVetement, useDeleteVetement } from '@/hooks/useVetements'
import { AppLayout } from '@/components/layout'
import { VetementCard, VetementForm } from '@/components/vetements'
import { EmptyState, Skeleton, BottomSheet, FloatingActionButton } from '@/components/ui'
import { isMock } from '@/services/mockFlag'

export default function CataloguePage() {
  const { t } = useTranslation()
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
    if (!confirm(t('catalogue.supprimer_confirm.titre'))) return
    await deleteVetement.mutateAsync(vetementId)
  }

  const mesModeles = vetements.filter(v => !v.is_systeme)
  const modelesSysteme = vetements.filter(v => v.is_systeme)

  return (
    <AppLayout title={t('catalogue.titre')}>
      <div className="p-4 space-y-5">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : (
          <>
            {/* Mon catalogue */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-dim uppercase tracking-wide">{t('catalogue.mon_catalogue')}</p>
                <span className="text-xs text-ghost">{mesModeles.length}</span>
              </div>
              {mesModeles.length === 0 ? (
                <EmptyState
                  icon={Scissors}
                  title={t('catalogue.vide.titre')}
                  description={t('catalogue.vide.description')}
                />
              ) : (
                <div className="space-y-2">
                  {mesModeles.map(v => (
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

            {/* Modèles système — uniquement en mode démo */}
            {isMock() && modelesSysteme.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold text-dim uppercase tracking-wide">{t('catalogue.gabarits_systeme')}</p>
                  <span className="text-xs text-ghost">{modelesSysteme.length}</span>
                </div>
                <div className="flex items-start gap-2 bg-subtle rounded-xl px-3 py-2 mb-2">
                  <Info size={13} className="text-ghost mt-0.5 shrink-0" />
                  <p className="text-xs text-ghost">Ces gabarits sont disponibles pour tous les ateliers. Ils ne sont pas modifiables.</p>
                </div>
                <div className="space-y-2">
                  {modelesSysteme.map(v => (
                    <VetementCard
                      key={v.id}
                      vetement={v}
                      onEdit={undefined}
                      onDelete={undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FloatingActionButton icon={Plus} onClick={() => setEditing('new')} />

      <BottomSheet
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={isNew ? t('catalogue.formulaire.titre_ajout') : t('catalogue.formulaire.titre_modification')}
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
