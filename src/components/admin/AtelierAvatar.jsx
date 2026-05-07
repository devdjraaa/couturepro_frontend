import { cn } from '@/utils/cn'

const PALETTE = [
  'bg-primary/15 text-primary',
  'bg-accent/15  text-accent',
  'bg-success/15 text-success',
  'bg-danger/15  text-danger',
  'bg-warning/15 text-warning',
  'bg-info/15    text-info',
]

function colorFor(name = '') {
  return PALETTE[(name.charCodeAt(0) ?? 0) % PALETTE.length]
}

export default function AtelierAvatar({ nom, sub, className }) {
  const initials = (nom ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', colorFor(nom))}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{nom ?? '—'}</p>
        {sub && <p className="text-xs text-ghost truncate">{sub}</p>}
      </div>
    </div>
  )
}
