import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui'

const PROFIL_OPTIONS = [
  { value: 'regulier',    label: 'Régulier' },
  { value: 'vip',         label: 'VIP' },
  { value: 'occasionnel', label: 'Occasionnel' },
]

export default function ClientForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    nom:       initialData?.nom       ?? '',
    telephone: initialData?.telephone ?? '',
    profil:    initialData?.profil    ?? 'regulier',
    notes:     initialData?.notes     ?? '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <Input
        label="Nom complet"
        value={form.nom}
        onChange={set('nom')}
        placeholder="Fatou Diallo"
        required
        autoFocus
      />
      <Input
        label="Téléphone"
        type="tel"
        value={form.telephone}
        onChange={set('telephone')}
        placeholder="+221 77 000 00 00"
        required
      />
      <Select
        label="Profil"
        value={form.profil}
        onChange={set('profil')}
        options={PROFIL_OPTIONS}
      />
      <Input
        label="Notes"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Remarques optionnelles…"
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Enregistrer' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
