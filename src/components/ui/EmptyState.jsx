import { cn } from '@/utils/cn'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  action, // legacy compat
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
          <Icon size={28} className="text-primary/60" />
        </div>
      )}
      {title && (
        <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-xs text-ghost max-w-xs leading-relaxed">{description}</p>
      )}
      {(primaryAction || action) && (
        <div className="mt-5 flex flex-col gap-2 w-full max-w-[220px]">
          {primaryAction ?? action}
          {secondaryAction && (
            <div className="mt-1">{secondaryAction}</div>
          )}
        </div>
      )}
    </div>
  )
}
