import { useState } from 'react'
import { cn } from '@/utils/cn'

export default function AdminTable({
  columns,
  rows,
  emptyLabel = 'Aucun résultat',
  selectable = false,
  onSelectionChange,
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
    </div>
  )
}
