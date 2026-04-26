import { useState, useRef, useEffect } from 'react'
import { Scissors, MoreHorizontal } from 'lucide-react'

export default function VetementCard({ vetement, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="bg-card border border-edge rounded-xl flex items-center gap-3 p-3">
      {vetement.image_url ? (
        <img
          src={vetement.image_url}
          alt={vetement.nom}
          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-subtle"
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Scissors size={20} className="text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{vetement.nom}</p>
        {vetement.is_systeme && (
          <span className="text-[10px] text-ghost bg-subtle px-1.5 py-0.5 rounded font-medium">Modèle</span>
        )}
      </div>
      {!vetement.is_systeme && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-subtle transition-colors"
          >
            <MoreHorizontal size={16} className="text-dim" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-edge rounded-xl shadow-md z-10 overflow-hidden min-w-[130px]">
              <button
                type="button"
                onClick={() => { setOpen(false); onEdit?.(vetement) }}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-subtle"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); onDelete?.(vetement.id) }}
                className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/5"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
