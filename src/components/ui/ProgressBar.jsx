import { cn } from '@/utils/cn'

const TRACK_COLORS = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-accent',
  danger:  'bg-danger',
  terra:   'bg-terra',
}

export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary',
  label,
  showValue = false,
  className,
}) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))
  // Rouge automatique à partir de 90%
  const trackColor = pct >= 90 ? TRACK_COLORS.danger : pct >= 70 ? TRACK_COLORS.warning : TRACK_COLORS[color]

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label    && <span className="text-xs text-dim">{label}</span>}
          {showValue && <span className="text-xs font-medium text-ink">{value}/{max}</span>}
        </div>
      )}
      <div className="h-1.5 bg-inset rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', trackColor)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
