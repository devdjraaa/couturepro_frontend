import { cn } from '@/utils/cn'

const frFmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export default function MoneyAmount({
  value,
  currency = 'XOF',
  size = 'md',
  color = 'default',
  className,
}) {
  const isNil = value === null || value === undefined || isNaN(value)
  const formatted = isNil ? '—' : frFmt.format(value)

  const sizes = {
    xs:  'text-sm',
    sm:  'text-base',
    md:  'text-2xl',
    lg:  'text-3xl',
    xl:  'text-4xl',
  }

  const colors = {
    default: 'text-ink',
    gold:    'text-gold',
    success: 'text-success',
    danger:  'text-danger',
    ghost:   'text-ghost',
  }

  return (
    <span className={cn('font-mono font-bold tabular-nums', sizes[size], colors[color], className)}>
      {formatted}
      {!isNil && (
        <span className="text-[0.65em] font-sans font-medium tracking-wide ml-1 opacity-70 uppercase">
          {currency}
        </span>
      )}
    </span>
  )
}
