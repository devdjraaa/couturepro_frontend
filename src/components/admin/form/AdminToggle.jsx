import { cn } from '@/utils/cn'

// Reprend Toggle de PlansPage.jsx. onChange(name, value), pas un événement.
export default function AdminToggle({ label, name, value, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-dim">{label}</span>
      <button
        type="button"
        onClick={() => onChange(name, !value)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          value ? 'bg-primary' : 'bg-inset',
        )}
      >
        <span className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-card transition-transform',
          value ? 'translate-x-4' : 'translate-x-1',
        )} />
      </button>
    </label>
  )
}
