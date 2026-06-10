import { differenceInCalendarDays, isToday, isPast, parseISO } from 'date-fns'
import { cn } from '@/utils/cn'

export default function CountdownBadge({ dueDate, className }) {
  if (!dueDate) return null

  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  const diff  = differenceInCalendarDays(date, new Date())

  let label, style

  if (isToday(date)) {
    label = "Aujourd'hui"
    style = 'bg-terra-50 text-terra'
  } else if (isPast(date)) {
    label = `J+${Math.abs(diff)} retard`
    style = 'bg-danger/10 text-danger'
  } else if (diff === 1) {
    label = 'Demain'
    style = 'bg-warning/10 text-warning'
  } else if (diff <= 3) {
    label = `J-${diff}`
    style = 'bg-gold-light text-gold-dark'
  } else {
    label = `J-${diff}`
    style = 'bg-subtle text-ghost'
  }

  return (
    <span className={cn(
      'inline-flex items-center text-2xs font-bold px-2 py-0.5 rounded-full shrink-0',
      style, className,
    )}>
      {label}
    </span>
  )
}
