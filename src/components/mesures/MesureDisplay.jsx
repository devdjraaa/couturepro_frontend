const toLabel = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function MesureDisplay({ libelles = [], mesures }) {
  if (!mesures) return null

  const filled = libelles.filter(k => mesures[k] != null)

  return (
    <div className="p-5">
      {filled.length === 0 ? (
        <p className="text-sm text-ghost text-center py-4">Aucune mesure enregistrée</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {filled.map(key => (
            <div key={key} className="flex items-center justify-between border-b border-edge pb-2">
              <span className="text-xs text-dim">{toLabel(key)}</span>
              <span className="text-sm font-semibold text-ink font-mono">{mesures[key]} cm</span>
            </div>
          ))}
        </div>
      )}
      {mesures.notes && (
        <p className="mt-4 text-sm text-dim bg-subtle rounded-xl px-3 py-2 italic">{mesures.notes}</p>
      )}
    </div>
  )
}
