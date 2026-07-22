import { cn } from '@/utils/cn'

export const ADMIN_INPUT = 'w-full border border-edge rounded-xl px-3 py-2 text-sm text-ink bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-subtle disabled:text-ghost'
export const ADMIN_LABEL = 'text-xs text-ghost block mb-1'

export default function AdminField({ label, rows, mono, className, ...props }) {
  const Tag = rows ? 'textarea' : 'input'

  return (
    <div>
      {label && <label className={ADMIN_LABEL}>{label}</label>}
      <Tag rows={rows} className={cn(ADMIN_INPUT, mono && 'font-mono', className)} {...props} />
    </div>
  )
}
