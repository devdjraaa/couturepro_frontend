import { cn } from '@/utils/cn'
import Spinner from './Spinner'

const variants = {
  primary:   'btn-primary-couture text-white font-bold',
  secondary: 'bg-elevated text-ink border border-edge hover:bg-subtle active:bg-inset shadow-sm',
  ghost:     'text-dim hover:bg-subtle hover:text-ink active:bg-inset',
  danger:    'bg-danger text-white font-semibold shadow-sm hover:brightness-110 active:brightness-90',
  accent:    'bg-accent text-white font-semibold shadow-sm hover:brightness-110 active:brightness-90',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2.5 rounded-2xl',
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
        'transition-all duration-150 active:scale-[0.97] disabled:active:scale-100',
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
