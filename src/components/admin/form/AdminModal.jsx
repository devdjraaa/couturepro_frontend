import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const sizeClass = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
}

// Hauteur plafonnée (max-h-[90vh]) + défilement interne au corps, jamais sur le
// conteneur extérieur : un dialogue centré (items-center) plus grand que l'écran
// et qui compte sur le scroll du parent devient inatteignable en haut (piège CSS
// classique). Voir aussi src/components/ui/Modal.jsx, qui suit déjà ce motif.
export default function AdminModal({ isOpen = true, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'bg-card rounded-2xl w-full shadow-xl flex flex-col max-h-[90vh]',
          sizeClass[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-edge shrink-0">
            <h3 className="font-semibold text-ink">{title}</h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ghost hover:text-ink hover:bg-subtle transition-colors ml-auto"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-edge shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
