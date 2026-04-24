import { cn } from '@/utils/cn'

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

const colors = {
  primary: 'border-primary/20 border-t-primary',
  inverse: 'border-white/30 border-t-white',
  dim:     'border-edge border-t-dim',
}

export default function Spinner({ size = 'md', color = 'primary', className }) {
  return (
    <div
      role="status"
      aria-label="Chargement…"
      className={cn('rounded-full animate-spin shrink-0', sizes[size], colors[color], className)}
    />
  )
}
