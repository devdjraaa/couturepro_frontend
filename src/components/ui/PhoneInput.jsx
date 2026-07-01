import { useState } from 'react'
import { cn } from '@/utils/cn'
import { PHONE_PREFIXES, DEFAULT_PREFIX, parsePhoneValue } from '@/utils/phonePrefixes'

export default function PhoneInput({
  label,
  value = '',
  onChange,
  required,
  error,
  hint,
  className,
  id,
}) {
  const parsed = parsePhoneValue(value)
  const [prefix, setPrefix] = useState(parsed.prefix)
  const [number, setNumber] = useState(parsed.number)

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  const emit = (p, n) => {
    if (!onChange) return
    const trimmed = n.trim()
    onChange({ target: { value: trimmed ? `${p} ${trimmed}` : '' } })
  }

  const handlePrefixChange = e => {
    const p = e.target.value
    setPrefix(p)
    emit(p, number)
  }

  const handleNumberChange = e => {
    const n = e.target.value
    setNumber(n)
    emit(prefix, n)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex h-12 bg-elevated border rounded-xl overflow-hidden transition-colors duration-150',
          error ? 'border-danger' : 'border-edge',
        )}
        style={{ '--tw-ring-color': 'var(--color-gold-soft)' }}
        onFocus={e => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--color-hair-gold)'
            e.currentTarget.style.boxShadow   = '0 0 0 4px var(--color-gold-soft)'
          }
        }}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.style.borderColor = ''
            e.currentTarget.style.boxShadow   = ''
          }
        }}
      >
        <select
          value={prefix}
          onChange={handlePrefixChange}
          aria-label="Indicatif pays"
          className="bg-subtle border-r border-edge text-ink text-sm pl-2 pr-1 focus:outline-none cursor-pointer shrink-0 font-medium"
        >
          {PHONE_PREFIXES.map(p => (
            <option key={p.code} value={p.code}>
              {p.flag} {p.code}
            </option>
          ))}
        </select>
        <input
          id={inputId}
          type="text"
          inputMode="tel"
          value={number}
          onChange={handleNumberChange}
          placeholder="97 00 00 00"
          required={required}
          className={cn(
            'flex-1 min-w-0 bg-transparent text-ink placeholder:text-ghost text-sm px-3',
            'focus:outline-none',
            className,
          )}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-ghost">{hint}</p>}
    </div>
  )
}
