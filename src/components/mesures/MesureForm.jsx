import { useState } from 'react'
import { Input, Button } from '@/components/ui'

const toLabel = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function MesureForm({ libelles = [], initialData, onSubmit, isLoading }) {
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(
      libelles.map(k => [k, initialData?.[k] != null ? String(initialData[k]) : ''])
    ),
    notes: initialData?.notes ?? '',
  }))

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(
      libelles.map(k => [k, form[k] !== '' ? Number(form[k]) : null])
    )
    onSubmit({ ...data, notes: form.notes })
  }

  if (libelles.length === 0) {
    return (
      <div className="p-5 text-center text-sm text-dim">
        Ce vêtement n'a pas encore de champs de mesures configurés.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {libelles.map(key => (
          <Input
            key={key}
            label={toLabel(key)}
            type="number"
            step="0.5"
            min="0"
            value={form[key]}
            onChange={set(key)}
            suffix="cm"
            placeholder="0"
          />
        ))}
      </div>
      <Input
        label="Notes"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Remarques sur la morphologie…"
      />
      <Button type="submit" loading={isLoading} className="w-full">
        Enregistrer les mesures
      </Button>
    </form>
  )
}
