import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  // Bloquer le scroll
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Fermer sur Échap
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: 'fade-in 150ms ease forwards' }}
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-card rounded-xl shadow-xl border border-edge',
          'flex flex-col max-h-[90vh]',
          sizeClass[size],
        )}
        style={{ animation: 'page-enter 200ms ease forwards' }}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge shrink-0">
            {title && (
              <h2 className="text-base font-semibold font-display text-ink">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ghost hover:text-ink hover:bg-subtle transition-colors ml-auto"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-edge shrink-0 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
