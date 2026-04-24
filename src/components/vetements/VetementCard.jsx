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
    <div className="bg-card border border-edge rounded-xl flex items-center gap-3 p-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Scissors size={18} className="text-primary" />
      </div>
      <p className="flex-1 text-sm font-medium text-ink truncate">{vetement.nom}</p>
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
    </div>
  )
}
