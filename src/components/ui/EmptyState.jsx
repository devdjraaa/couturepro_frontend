import { cn } from '@/utils/cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-10 px-6 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Icon size={26} className="text-primary" />
        </div>
      )}
      {title && (
        <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-xs text-dim max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
