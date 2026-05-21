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
        <div className="relative mb-6 flex items-center justify-center">
          {/* Halo rings */}
          <div className="absolute w-32 h-32 rounded-full bg-primary/[0.04]" />
          <div className="absolute w-24 h-24 rounded-full bg-primary/[0.06]" />
          {/* Icon tile */}
          <div className="relative w-20 h-20 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center">
            <Icon size={34} className="text-primary/65" strokeWidth={1.5} />
          </div>
          {/* Accent dots */}
          <span className="absolute top-2 right-1.5 w-2.5 h-2.5 rounded-full bg-accent/75" />
          <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-primary/45" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-ink mb-1.5">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-ghost max-w-[260px] leading-relaxed">{description}</p>
      )}
      {(primaryAction || action) && (
        <div className="mt-6 flex flex-col gap-2 w-full max-w-[220px]">
          {primaryAction ?? action}
          {secondaryAction && (
            <div className="mt-1">{secondaryAction}</div>
          )}
        </div>
      )}
    </div>
  )
}
