import { format, formatDistanceToNow, parseISO, isValid, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'

function toDate(value) {
  if (!value) return null
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? d : null
}

export function formatDate(value, pattern = 'dd MMM yyyy') {
  const d = toDate(value)
  if (!d) return '—'
  return format(d, pattern, { locale: fr })
}

export function formatDateShort(value) {
  return formatDate(value, 'dd/MM/yyyy')
}

export function formatDateFull(value) {
  return formatDate(value, 'EEEE dd MMMM yyyy')
}

export function formatDateTime(value) {
  return formatDate(value, 'dd MMM yyyy à HH:mm')
}

export function formatRelative(value) {
  const d = toDate(value)
  if (!d) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function isDatePast(value) {
  const d = toDate(value)
  if (!d) return false
  return isPast(d)
}

// Retourne le nombre de jours jusqu'à la date (négatif si passé)
export function daysUntil(value) {
  const d = toDate(value)
  if (!d) return null
  return differenceInDays(d, new Date())
}

// Retourne true si la date est dans les prochaines N heures
export function isWithinHours(value, hours = 48) {
  const d = toDate(value)
  if (!d) return false
  const diff = differenceInDays(d, new Date())
  return diff >= 0 && diff <= hours / 24
}
