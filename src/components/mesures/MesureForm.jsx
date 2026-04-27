import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useAuth } from '@/contexts'
import { Input, Button } from '@/components/ui'

const SUGGESTIONS = [
  'Poitrine', 'Taille', 'Hanches', 'Épaules', 'Longueur dos',
  'Longueur bras', 'Tour de bras', 'Tour de cou', 'Entrejambe', 'Longueur robe',
]

const toSlug = (str) =>
  str.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

export default function MesureForm({ initialData, onSubmit, isLoading }) {
  const { atelier } = useAuth()
  const uniteMesure = atelier?.unite_mesure ?? 'cm'
  const [fields, setFields] = useState(() => {
    const champs = initialData && typeof initialData === 'object' ? initialData : {}
    return Object.entries(champs)
      .filter(([k]) => k !== 'notes')
      .map(([k, v]) => ({ key: k, label: k.replace(/_/g, ' '), value: v != null ? String(v) : '' }))
  })
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [newLabel, setNewLabel] = useState('')

  const addField = (label) => {
    const trimmed = label.trim()
    if (!trimmed) return
    const key = toSlug(trimmed)
    if (!key || fields.some(f => f.key === key)) return
    setFields(f => [...f, { key, label: trimmed, value: '' }])
    setNewLabel('')
  }

  const removeField = (key) => setFields(f => f.filter(x => x.key !== key))

  const setValue = (key, value) =>
    setFields(f => f.map(x => x.key === key ? { ...x, value } : x))

  const handleSubmit = (e) => {
    e.preventDefault()
    const champs = Object.fromEntries(
      fields.map(({ key, value }) => [key, value !== '' ? Number(value) : null])
    )
    onSubmit({ ...champs, notes: notes || undefined })
  }

  const unusedSuggestions = SUGGESTIONS.filter(s => !fields.some(f => f.key === toSlug(s)))

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label, value }) => (
            <div key={key} className="relative">
              <Input
                label={label.charAt(0).toUpperCase() + label.slice(1)}
                type="number"
                step="0.5"
                min="0"
                value={value}
                onChange={e => setValue(key, e.target.value)}
                suffix={uniteMesure}
                placeholder="0"
              />
              <button
                type="button"
                onClick={() => removeField(key)}
                className="absolute top-0 right-0 p-1 text-ghost hover:text-danger"
                aria-label="Supprimer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {unusedSuggestions.length > 0 && (
        <div>
          <p className="text-xs text-dim mb-2">Suggestions rapides</p>
          <div className="flex flex-wrap gap-2">
            {unusedSuggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => addField(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-edge bg-card text-dim hover:border-primary hover:text-primary transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          label="Ajouter un champ"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(newLabel) } }}
          placeholder="ex: Tour de tête"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => addField(newLabel)}
          className="mt-5 p-2 rounded-xl border border-edge bg-card text-dim hover:text-primary hover:border-primary transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <Input
        label="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Remarques sur la morphologie…"
      />

      <Button type="submit" loading={isLoading} className="w-full">
        Enregistrer les mesures
      </Button>
    </form>
  )
}
