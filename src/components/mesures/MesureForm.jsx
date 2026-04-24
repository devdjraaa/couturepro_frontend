import { useState } from 'react'
import { Input, Button } from '@/components/ui'

const FIELDS = [
  { key: 'poitrine',          label: 'Poitrine'       },
  { key: 'tour_de_taille',    label: 'Tour de taille' },
  { key: 'hanches',           label: 'Hanches'        },
  { key: 'longueur_dos',      label: 'Longueur dos'   },
  { key: 'epaules',           label: 'Épaules'        },
  { key: 'longueur_manche',   label: 'Lg. manche'     },
  { key: 'tour_de_bras',      label: 'Tour de bras'   },
  { key: 'longueur_robe',     label: 'Lg. robe'       },
  { key: 'tour_de_cuisse',    label: 'Tour cuisse'    },
  { key: 'longueur_pantalon', label: 'Lg. pantalon'   },
  { key: 'tour_de_cou',       label: 'Tour de cou'    },
]

export default function MesureForm({ initialData, onSubmit, isLoading }) {
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(FIELDS.map(f => [f.key, ''])),
    notes: '',
    ...initialData,
    // normalise les valeurs numériques en string pour les inputs
    ...Object.fromEntries(
      FIELDS.map(f => [f.key, initialData?.[f.key] != null ? String(initialData[f.key]) : ''])
    ),
  }))

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(
      FIELDS.map(f => [f.key, form[f.key] !== '' ? Number(form[f.key]) : null])
    )
    onSubmit({ ...data, notes: form.notes })
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label }) => (
          <Input
            key={key}
            label={label}
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
