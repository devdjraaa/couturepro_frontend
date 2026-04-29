import { useState } from 'react'
import { Archive } from 'lucide-react'
import { useArchiver } from '@/hooks/useArchives'
import { usePermission } from '@/hooks/usePermission'

/**
 * Bouton "Archiver" à placer sur une fiche (client, commande, mesure).
 * Visible uniquement si l'utilisateur a la permission entityType.archive.
 * Propose une note optionnelle avant de confirmer.
 */
export default function ArchiveButton({ entityType, entityId, onSuccess }) {
  const permKey   = `${entityType}s.archive`
  const canArchive = usePermission(permKey)
  const archiver   = useArchiver(entityType, entityId)

  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')

  if (!canArchive) return null

  const handleSubmit = async e => {
    e.preventDefault()
    await archiver.mutateAsync(note)
    setOpen(false)
    setNote('')
    onSuccess?.()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-amber-600 font-medium"
      >
        <Archive size={15} />
        Archiver
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <p className="text-sm font-medium text-amber-800">Archiver cet élément</p>
      <p className="text-xs text-amber-700">
        Le patron sera notifié. Ajoutez une note pour expliquer la raison (optionnel).
      </p>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Raison de l'archivage…"
        rows={2}
        className="w-full text-sm border border-amber-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-400 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setNote('') }}
          className="flex-1 text-sm text-dim border border-edge rounded-xl py-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={archiver.isPending}
          className="flex-1 text-sm text-white bg-amber-500 rounded-xl py-2 disabled:opacity-50"
        >
          {archiver.isPending ? '…' : 'Confirmer'}
        </button>
      </div>
    </form>
  )
}
