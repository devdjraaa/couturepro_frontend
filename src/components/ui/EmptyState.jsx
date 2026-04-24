import { cn } from '@/utils/cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-xl bg-subtle flex items-center justify-center mb-4">
          <Icon size={28} className="text-ghost" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold font-display text-ink mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-dim max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
