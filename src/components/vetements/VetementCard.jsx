import { useState, useRef, useEffect } from 'react'
import { Scissors, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

export default function VetementCard({ vetement, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)
  const menuRef = useRef(null)

  const images = vetement.images_urls?.length > 0
    ? vetement.images_urls
    : vetement.image_url ? [vetement.image_url] : []

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length) }
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length) }

  return (
    <div className="bg-card border border-edge rounded-xl flex items-center gap-3 p-3">
      {/* Image / galerie */}
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-primary/10">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIndex]}
              alt={vetement.nom}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-full bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={10} />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-full bg-black/30 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={10} />
                </button>
                <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Scissors size={20} className="text-primary" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{vetement.nom}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {vetement.is_systeme ? (
            <span className="text-[10px] text-ghost bg-subtle px-1.5 py-0.5 rounded font-medium">Modèle système</span>
          ) : (
            <span className="text-[10px] text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded font-medium">Mon catalogue</span>
          )}
          {images.length > 1 && (
            <span className="text-[10px] text-ghost">{images.length} photos</span>
          )}
        </div>
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
