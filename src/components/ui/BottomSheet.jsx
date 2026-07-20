import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { registerBackHandler } from '@/utils/backHandler'

/**
 * Panneau glissant depuis le bas.
 *
 * `footer` : rangée d'actions COLLÉE en pied de panneau. Sans elle, les boutons
 * « Annuler / Créer » se trouvent en fin de formulaire : sur un petit écran
 * (360x640, très répandu au Bénin), il faut dérouler toute la saisie pour les
 * atteindre, et la barre de navigation du système vient s'y superposer.
 * Constaté par la direction, reproduit en QA le 20/07 sur la facturation où les
 * boutons tombaient à 818 px pour un écran de 640.
 */
export default function BottomSheet({ isOpen, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // P4 : le bouton retour physique ferme la feuille (comme « Annuler »).
  useEffect(() => {
    if (!isOpen) return
    return registerBackHandler(onClose)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: 'fade-in 150ms ease forwards' }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative bg-card rounded-t-2xl shadow-xl border-t border-edge',
          'flex flex-col max-h-[92vh]',
          className,
        )}
        style={{ animation: 'slide-up 280ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        {/* Poignée */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-inset rounded-full" />
        </div>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-edge shrink-0">
            <h2 className="text-base font-semibold font-display text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ghost hover:text-ink hover:bg-subtle transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {/* Corps défilant */}
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>

        {/* Pied d'actions : toujours visible, au-dessus de la barre système. */}
        {footer && (
          <div className="shrink-0 border-t border-edge bg-card px-5 py-3
                          pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
