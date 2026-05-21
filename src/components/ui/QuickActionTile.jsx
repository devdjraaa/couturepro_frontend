import { cn } from '@/utils/cn'

const COLOR_MAP = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger:  'bg-danger/10  text-danger',
  gold:    'bg-gold-light text-gold-dark',
  ghost:   'bg-subtle     text-ghost',
}

export default function QuickActionTile({ icon: Icon, label, color = 'primary', badge, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-2 p-3',
        'bg-card border border-edge rounded-xl shadow-xs',
        'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
        'active:scale-95 active:shadow-xs transition-all duration-150',
        className,
      )}
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105', COLOR_MAP[color] ?? COLOR_MAP.primary)}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <span className="text-xs font-semibold text-ink text-center leading-tight">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-danger text-inverse text-2xs font-bold rounded-full flex items-center justify-center px-1 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
