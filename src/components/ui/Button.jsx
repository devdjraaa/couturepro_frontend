import { cn } from '@/utils/cn'
import Spinner from './Spinner'

const variants = {
  primary:   'bg-primary text-inverse hover:bg-primary-600 active:bg-primary-700 shadow-sm',
  secondary: 'bg-card text-ink border border-edge hover:bg-subtle active:bg-inset shadow-sm',
  ghost:     'text-dim hover:bg-subtle hover:text-ink active:bg-inset',
  danger:    'bg-danger text-inverse hover:bg-red-700 active:bg-red-800 shadow-sm',
  accent:    'bg-accent text-inverse hover:bg-amber-600 active:bg-amber-700 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-sans font-medium rounded-xl',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading
        ? <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'dim' : 'inverse'} />
        : Icon && <Icon size={iconSize} className="shrink-0" />
      }
      {children && <span>{children}</span>}
      {!loading && IconRight && <IconRight size={iconSize} className="shrink-0" />}
    </button>
  )
}
