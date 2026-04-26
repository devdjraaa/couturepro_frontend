import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/utils/cn'

const MAX_IMAGES = 5

export default function VetementForm({ initialData, onSubmit, onCancel, isLoading }) {
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
        label="Nom du modèle"
        value={nom}
        onChange={e => setNom(e.target.value)}
        placeholder="Robe de soirée, Boubou grand…"
        required
        autoFocus
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-ink">Photos du modèle</p>
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
                <span className="text-[10px]">Ajouter</span>
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
            <ImagePlus size={28} />
            <span className="text-xs">Ajouter des photos</span>
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
          <p className="text-xs text-ghost mt-1.5">JPG, PNG, WebP — max 4 Mo par photo — {MAX_IMAGES} photos max</p>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
