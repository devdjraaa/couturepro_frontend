import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Images, ImagePlus, BadgeCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

/**
 * Mini-tutoriel en 3 slides expliquant comment alimenter la galerie photo
 * depuis le téléphone (standard Android : sélecteur système multi-sélection).
 * Affiché à la première visite de la galerie, réouvrable via le bouton d'aide.
 */
export default function GalerieTutorial({ isOpen, onClose }) {
  const { t } = useTranslation()
  const [i, setI] = useState(0)
  if (!isOpen) return null

  const slides = [
    { icon: Images,     titre: t('galerie.tuto.s1_titre'), texte: t('galerie.tuto.s1_texte') },
    { icon: ImagePlus,  titre: t('galerie.tuto.s2_titre'), texte: t('galerie.tuto.s2_texte') },
    { icon: BadgeCheck, titre: t('galerie.tuto.s3_titre'), texte: t('galerie.tuto.s3_texte') },
  ]
  const last = i === slides.length - 1
  const S = slides[i]
  const Icon = S.icon

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-app flex flex-col">
      {/* Passer */}
      <div className="flex justify-end p-4 pt-safe">
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-ghost hover:text-ink px-2 py-1"
        >
          {t('galerie.tuto.passer')}
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={44} strokeWidth={1.6} />
        </div>
        <h2 className="text-2xl font-bold font-display text-ink">{S.titre}</h2>
        <p className="text-base text-dim leading-relaxed max-w-sm">{S.texte}</p>
      </div>

      {/* Indicateurs + navigation */}
      <div className="p-6 pb-[calc(1.5rem+var(--safe-area-bottom))] space-y-5">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, k) => (
            <span
              key={k}
              className={cn('h-2 rounded-full transition-all', k === i ? 'w-6 bg-primary' : 'w-2 bg-edge')}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {i > 0 && (
            <button
              type="button"
              onClick={() => setI(i - 1)}
              className="flex-1 py-3 rounded-2xl border border-edge text-ink font-semibold"
            >
              {t('commun.precedent')}
            </button>
          )}
          <button
            type="button"
            onClick={() => (last ? onClose() : setI(i + 1))}
            className="flex-1 py-3 rounded-2xl bg-primary text-inverse font-semibold active:scale-[0.98] transition"
          >
            {last ? t('galerie.tuto.commencer') : t('commun.suivant')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
