import { useRef, useState } from 'react'
import { ImagePlus, Trash2, X, Images, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { Button, Skeleton, EmptyState } from '@/components/ui'
import FeatureGate from '@/components/abonnement/FeatureGate'
import GalerieTutorial from '@/components/galerie/GalerieTutorial'
import { useGalerie, useGalerieQuota, useUploadPhoto, useDeletePhoto } from '@/hooks/useGalerie'
import { compressImage } from '@/utils/compressImage'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatDate'

function QuotaBadge({ quota }) {
  const { t } = useTranslation()
  if (!quota) return null
  if (quota.illimite) {
    return <span className="text-xs text-ghost bg-subtle px-2 py-0.5 rounded-full">{t('galerie.illimitees')}</span>
  }
  const pct = quota.max > 0 ? Math.min(100, (quota.utilise / quota.max) * 100) : 0
  const restant = quota.max - quota.utilise
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-edge overflow-hidden">
        <div
          className={cn('h-full rounded-full', pct >= 90 ? 'bg-error' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ghost">{t('galerie.restantes', { n: restant < 0 ? 0 : restant })}</span>
    </div>
  )
}

export default function GaleriePage() {
  const { t } = useTranslation()
  const fileRef  = useRef(null)
  const [preview, setPreview] = useState(null)

  const { data: photos = [], isLoading } = useGalerie()
  const { data: quota }   = useGalerieQuota()
  const upload            = useUploadPhoto()
  const deletePhoto       = useDeletePhoto()

  const [showTuto, setShowTuto] = useState(() => {
    try { return !localStorage.getItem('gx_galerie_tuto_seen') } catch { return false }
  })
  const closeTuto = () => {
    try { localStorage.setItem('gx_galerie_tuto_seen', '1') } catch { /* indisponible */ }
    setShowTuto(false)
  }

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || [])
    if (fileRef.current) fileRef.current.value = '' // reset tôt (permet de re-choisir les mêmes)
    if (!files.length) return
    // Le sélecteur système permet de cocher plusieurs photos. On les envoie une par
    // une, APRÈS compression (les photos de téléphone dépassent souvent la limite de
    // 5 Mo du serveur → 422 silencieux). try/catch par photo : une erreur ne bloque
    // pas les suivantes (le hook affiche déjà un toast).
    const restant = (quota && !quota.illimite) ? Math.max(0, quota.restant ?? files.length) : files.length
    const aEnvoyer = files.slice(0, restant)
    for (const file of aEnvoyer) {
      try {
        const compressed = await compressImage(file)
        await upload.mutateAsync({ file: compressed })
      } catch { /* toast d'erreur déjà géré par le hook ; on continue */ }
    }
  }

  return (
    <AppLayout title={t('galerie.titre')}>
      <FeatureGate featureKey="photos_vip" featureName={t('galerie.feature_name')}>
        <div className="p-4 space-y-4">

          {/* En-tête quota + bouton upload */}
          <div className="flex items-center justify-between">
            <QuotaBadge quota={quota} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTuto(true)}
                aria-label={t('galerie.tuto.aide')}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-edge text-ghost hover:text-ink transition-colors"
              >
                <HelpCircle size={16} />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={upload.isPending || (quota && !quota.illimite && quota.restant <= 0)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-inverse text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <ImagePlus size={15} />
                {upload.isPending ? t('galerie.upload') : t('commun.ajouter')}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Quota épuisé */}
          {quota && !quota.illimite && quota.restant <= 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-sm text-warning font-medium">
              {t('galerie.quota_atteint')}
            </div>
          )}

          {/* Grille photos */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
            </div>
          ) : photos.length === 0 ? (
            <EmptyState
              icon={Images}
              title={t('galerie.vide_titre')}
              description={t('galerie.vide_desc')}
              action={
                <Button onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
                  <ImagePlus size={15} className="mr-1" /> {t('galerie.ajouter_photo')}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-edge bg-subtle aspect-square">
                  <img
                    src={photo.file_url}
                    alt={photo.nom}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Overlay supprimer */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                    <p className="text-xs text-inverse font-medium truncate flex-1 pr-2">{photo.nom}</p>
                    <button
                      type="button"
                      onClick={() => deletePhoto.mutate(photo.id)}
                      className="w-8 h-8 bg-error rounded-full flex items-center justify-center text-inverse shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {/* Date (mobile : toujours visible) */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 pb-1 bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-0 transition-opacity md:block">
                    <p className="text-xs text-inverse/80">{formatDate(photo.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lightbox simple */}
          {preview && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setPreview(null)}
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-inverse"
                onClick={() => setPreview(null)}
              >
                <X size={24} />
              </button>
              <img src={preview} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
            </div>
          )}

          <GalerieTutorial isOpen={showTuto} onClose={closeTuto} />
        </div>
      </FeatureGate>
    </AppLayout>
  )
}
