import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

function Paginator({ current, last, onPage }) {
  if (last < 1) return null

  const pages = []
  if (last <= 7) {
    for (let i = 1; i <= last; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3)        pages.push('…')
    for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i)
    if (current < last - 2) pages.push('…')
    pages.push(last)
  }

  const btn = 'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPage(current - 1)} disabled={current <= 1}
        className={cn(btn, 'border border-edge text-ghost hover:text-ink hover:border-edge-strong disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronLeft size={13} />
      </button>

      {pages.map((p, i) => p === '…' ? (
        <span key={`el-${i}`} className="px-1 text-ghost text-xs select-none">…</span>
      ) : (
        <button
          key={p} onClick={() => onPage(p)}
          className={cn(btn, p === current
            ? 'bg-primary text-inverse'
            : 'border border-edge text-ghost hover:text-ink hover:border-edge-strong')}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPage(current + 1)} disabled={current >= last}
        className={cn(btn, 'border border-edge text-ghost hover:text-ink hover:border-edge-strong disabled:opacity-40 disabled:cursor-not-allowed')}
      >
        <ChevronRight size={13} />
      </button>
    </div>
  )
}

export default function AdminTable({
  columns,
  rows,
  emptyLabel = 'Aucun résultat',
  selectable = false,
  onSelectionChange,
  currentPage,
  lastPage,
  onPage,
}) {
  const [selected, setSelected] = useState(new Set())

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const all = new Set(rows.map((r, i) => r.id ?? i))
      setSelected(all)
      onSelectionChange?.(rows)
    }
  }

  const toggleRow = (id, row) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
    onSelectionChange?.(rows.filter((r, i) => next.has(r.id ?? i)))
  }

  const allSelected  = rows.length > 0 && selected.size === rows.length
  const someSelected = selected.size > 0 && selected.size < rows.length
  const hasPagination = currentPage != null && lastPage != null && onPage != null

  return (
    <div className="bg-card border border-edge rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-subtle border-b border-edge">
            <tr>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-edge accent-primary"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className="text-left text-2xs font-semibold text-ghost uppercase tracking-widest px-4 py-3 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-10 text-center text-ghost text-sm"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : rows.map((row, i) => {
              const id         = row.id ?? i
              const isSelected = selected.has(id)
              return (
                <tr
                  key={id}
                  className={cn(
                    'transition-colors',
                    isSelected ? 'bg-primary/5' : 'hover:bg-subtle',
                  )}
                >
                  {selectable && (
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(id, row)}
                        className="w-4 h-4 rounded border-edge accent-primary"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-ink">
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasPagination && (
        <div className="flex items-center justify-center px-4 py-3 border-t border-edge">
          <Paginator current={currentPage} last={lastPage} onPage={onPage} />
        </div>
      )}
    </div>
  )
}
