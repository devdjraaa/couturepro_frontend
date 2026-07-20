import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePlus, X, Shirt } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/utils/cn'
import { usePlanLimit } from '@/hooks/usePlanFeature'

// S02A-28 : repli si l'abonnement n'est pas encore chargé. La vraie limite vient
// du plan (`max_photos_vetement`, éditable en admin) — elle était figée à 5 pour
// toutes les formules, et le serveur, lui, n'en imposait aucune.
const MAX_IMAGES_DEFAUT = 5

export default function VetementForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation()
  const { max: maxPlan } = usePlanLimit('max_photos_vetement')
  const MAX_IMAGES = maxPlan ?? MAX_IMAGES_DEFAUT
  const [nom, setNom] = useState(initialData?.nom ?? '')
  const [previews, setPreviews] = useState(initialData?.images_urls ?? (initialData?.image_url ? [initialData.image_url] : []))
  const [files, setFiles] = useState([])
  const fileRef = useRef(null)

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - previews.length
    const toAdd = selected.slice(0, remaining)
    if (toAdd.length === 0) return

    setFiles(prev => [...prev, ...toAdd])
    setPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => {
      const existingCount = (initialData?.images_urls?.length ?? (initialData?.image_url ? 1 : 0))
      const fileIndex = index - existingCount
      if (fileIndex < 0) return prev
      return prev.filter((_, i) => i !== fileIndex)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ nom: nom.trim(), images: files.length > 0 ? files : undefined })
  }

  const canAddMore = previews.length < MAX_IMAGES

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      <Input
        label={t('catalogue.formulaire.nom')}
        value={nom}
        onChange={e => setNom(e.target.value)}
        placeholder={t('catalogue.formulaire.nom_placeholder')}
        required
        autoFocus
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-ink">{t('catalogue.formulaire.photos')}</p>
          <span className="text-xs text-ghost">{previews.length}/{MAX_IMAGES}</span>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-edge">
                <img src={src} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {canAddMore && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'aspect-square rounded-xl border-2 border-dashed border-edge',
                  'flex flex-col items-center justify-center gap-1 text-ghost',
                  'hover:border-primary hover:text-primary transition-colors',
                )}
              >
                <ImagePlus size={20} />
                <span className="text-[10px]">{t('commun.ajouter')}</span>
              </button>
            )}
          </div>
        )}

        {previews.length === 0 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-edge flex flex-col items-center justify-center gap-2 text-ghost hover:border-primary hover:text-primary transition-colors"
          >
            {/* SUG-17 : icône officielle du module « modèle » (Shirt, cohérente avec la nav
                et l'action-sheet « Nouveau modèle ») au lieu d'un placeholder image générique. */}
            <Shirt size={28} />
            <span className="text-xs">{t('catalogue.formulaire.ajouter_photos')}</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        {previews.length === 0 && (
          <p className="text-xs text-ghost mt-1.5">{t('catalogue.formulaire.photos_aide', { n: MAX_IMAGES })}</p>
        )}
      </div>

      {/* S02A-25/26 : un SEUL bouton d'action, en pied de panneau collant — il
          défilait hors écran sur les fiches longues. En édition, le libellé est
          « Enregistrer » : l'utilisateur est déjà dans l'écran de modification. */}
      <div className="sticky bottom-0 -mx-5 mt-2 flex gap-3 border-t border-edge bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          {t('commun.annuler')}
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? t('catalogue.formulaire.enregistrer') : t('catalogue.formulaire.ajouter')}
        </Button>
      </div>
    </form>
  )
}
