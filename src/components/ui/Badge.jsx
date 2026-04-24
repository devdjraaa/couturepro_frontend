import { cn } from '@/utils/cn'

const variants = {
  default: 'bg-subtle text-dim border-edge',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  terra:   'bg-orange-50 text-terra border-orange-200',
}

const sizes = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
}

export default function Badge({ children, variant = 'default', size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-sm border',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
