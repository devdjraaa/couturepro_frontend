import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'

export default function VetementForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [nom, setNom] = useState(initialData?.nom ?? '')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(initialData?.image_url ?? null)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ nom: nom.trim(), image: image ?? undefined })
  }

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
        <p className="text-sm font-medium text-ink mb-2">Photo du modèle</p>
        {preview ? (
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-edge">
            <img src={preview} alt="aperçu" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-edge flex flex-col items-center justify-center gap-2 text-ghost hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus size={28} />
            <span className="text-xs">Ajouter une photo</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        {!preview && (
          <p className="text-xs text-ghost mt-1.5">JPG, PNG, WebP — max 4 Mo</p>
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
