import { cn } from '@/utils/cn'

export default function Card({ children, className, onClick, padding = true, as: Tag }) {
  const Component = Tag ?? (onClick ? 'button' : 'div')

  return (
    <Component
      onClick={onClick}
      type={Component === 'button' ? 'button' : undefined}
      className={cn(
        'bg-card border border-edge rounded-lg shadow-sm',
        padding && 'p-4',
        onClick && [
          'w-full text-left cursor-pointer',
          'transition-all duration-150',
          'hover:shadow-md hover:border-edge-strong',
          'active:scale-[0.99]',
        ],
        className,
      )}
    >
      {children}
    </Component>
  )
}
