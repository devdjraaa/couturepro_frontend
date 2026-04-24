import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, suffix, className, id, required, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ghost">
            <Icon size={16} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn(
            'w-full h-10 bg-card text-ink placeholder:text-ghost',
            'border border-edge rounded px-3 text-sm font-sans',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            Icon    && 'pl-9',
            suffix  && 'pr-10',
            error   && 'border-danger focus:ring-danger/30 focus:border-danger',
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-ghost">
            {typeof suffix === 'string'
              ? <span className="text-sm">{suffix}</span>
              : suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-ghost">{hint}</p>}
    </div>
  )
})

export default Input
