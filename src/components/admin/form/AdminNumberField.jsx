import { cn } from '@/utils/cn'
import { ADMIN_INPUT, ADMIN_LABEL } from './AdminField'

// Reprend NumField de PlansPage.jsx : un champ numérique avec bascule "illimité"
// (-1) optionnelle. onChange(name, value) et non un événement — pratique pour
// écrire directement dans un objet de config imbriqué (setCfg).
export default function AdminNumberField({ label, name, value, onChange, unlimited = false, hint }) {
  const isUnlimited = value === -1 || value === null

  const handleChange = e => {
    const v = e.target.value
    if (v === '') { onChange(name, unlimited ? -1 : 0); return }
    onChange(name, Number(v))
  }

  return (
    <div>
      {label && <label className={ADMIN_LABEL}>{label}</label>}
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          value={isUnlimited ? '' : (value ?? '')}
          onChange={handleChange}
          disabled={isUnlimited}
          placeholder={isUnlimited ? '∞' : '0'}
          className={ADMIN_INPUT}
        />
        {unlimited && (
          <button
            type="button"
            onClick={() => onChange(name, isUnlimited ? 0 : -1)}
            title={isUnlimited ? 'Définir une limite' : 'Illimité (-1)'}
            className={cn(
              'px-2.5 rounded-xl border text-sm font-mono shrink-0 transition-colors',
              isUnlimited
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-edge text-ghost hover:border-edge-strong',
            )}
          >
            ∞
          </button>
        )}
      </div>
      {hint && <p className="text-2xs text-ghost mt-0.5">{hint}</p>}
    </div>
  )
}
