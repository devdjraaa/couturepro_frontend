import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui'
import { AVATAR_PALETTES } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

const PROFIL_OPTIONS = [
  { value: 'regulier',    label: 'Régulier' },
  { value: 'vip',         label: 'VIP' },
  { value: 'occasionnel', label: 'Occasionnel' },
]

export default function ClientForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    nom:          initialData?.nom          ?? '',
    prenom:       initialData?.prenom       ?? '',
    telephone:    initialData?.telephone    ?? '',
    type_profil:  initialData?.type_profil  ?? initialData?.profil ?? 'regulier',
    notes:        initialData?.notes        ?? '',
    avatar_index: initialData?.avatar_index ?? null,
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      {/* Sélecteur avatar */}
      <div>
        <p className="text-sm font-medium text-ink mb-2">Avatar</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_PALETTES.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setForm(f => ({ ...f, avatar_index: f.avatar_index === i ? null : i }))}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                p.bg,
                form.avatar_index === i ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-70',
              )}
            >
              {p.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Prénom" value={form.prenom} onChange={set('prenom')} placeholder="Fatou" autoFocus />
        <Input label="Nom" value={form.nom} onChange={set('nom')} placeholder="Diallo" required />
      </div>
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
        value={form.type_profil}
        onChange={set('type_profil')}
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
