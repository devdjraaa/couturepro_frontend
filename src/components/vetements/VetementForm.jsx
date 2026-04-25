import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Input, Button } from '@/components/ui'

const toSlug = (str) =>
  str.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')

const toDisplay = (slug) =>
  slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function VetementForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [nom, setNom] = useState(initialData?.nom ?? '')
  const [libelles, setLibelles] = useState(
    Array.isArray(initialData?.libelles_mesures) ? initialData.libelles_mesures : []
  )
  const [newLabel, setNewLabel] = useState('')

  const addLabel = () => {
    const slug = toSlug(newLabel)
    if (!slug || libelles.includes(slug)) { setNewLabel(''); return }
    setLibelles(prev => [...prev, slug])
    setNewLabel('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addLabel() }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ nom: nom.trim(), libelles_mesures: libelles })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      <Input
        label="Nom du vêtement"
        value={nom}
        onChange={e => setNom(e.target.value)}
        placeholder="Boubou grand, Robe de soirée…"
        required
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          Champs de mesures
          <span className="ml-1 text-xs text-ghost font-normal">(ex : Poitrine, Taille, Hanches)</span>
        </label>

        {libelles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {libelles.map(slug => (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1.5 rounded-full"
              >
                {toDisplay(slug)}
                <button
                  type="button"
                  onClick={() => setLibelles(prev => prev.filter(l => l !== slug))}
                  className="hover:text-danger transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex : Tour de poitrine…"
          />
          <Button
            type="button"
            variant="secondary"
            icon={Plus}
            onClick={addLabel}
            disabled={!newLabel.trim()}
            className="shrink-0"
          >
            Ajouter
          </Button>
        </div>
        <p className="text-xs text-ghost mt-1.5">
          Tapez un nom et appuyez sur Entrée pour l'ajouter.
        </p>
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
