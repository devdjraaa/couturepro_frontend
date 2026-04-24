import { cn } from '@/utils/cn'

export default function Skeleton({ className, variant = 'rect', width, height }) {
  return (
    <div
      className={cn(
        'skeleton',
        variant === 'circle' && 'rounded-full',
        variant === 'line'   && 'rounded h-4',
        variant === 'rect'   && 'rounded-lg',
        className,
      )}
      style={{ width, height }}
    />
  )
}

// Composant utilitaire pour les listes skeleton
export function SkeletonList({ count = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 border border-edge flex gap-3">
          <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton variant="line" className="w-2/3" />
            <Skeleton variant="line" className="w-1/3 h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}
