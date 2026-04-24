import { cn } from '@/utils/cn'

const STATUTS = [
  { key: 'en_cours', label: 'En cours',  className: 'border-primary  text-primary  bg-primary/5' },
  { key: 'essai',    label: 'Essayage',  className: 'border-warning  text-warning  bg-warning/5' },
  { key: 'livre',    label: 'Livré',     className: 'border-success  text-success  bg-success/5' },
  { key: 'annule',   label: 'Annulé',    className: 'border-edge     text-ghost    bg-subtle'    },
]

export default function StatutSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STATUTS.map(s => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={cn(
            'py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-150',
            value === s.key ? s.className : 'border-edge text-dim hover:bg-subtle',
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
