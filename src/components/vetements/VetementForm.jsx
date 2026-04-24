import { useState } from 'react'
import { Input, Button } from '@/components/ui'

export default function VetementForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [nom, setNom] = useState(initialData?.nom ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ nom: nom.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <Input
        label="Nom du vêtement"
        value={nom}
        onChange={e => setNom(e.target.value)}
        placeholder="Boubou grand, Robe de soirée…"
        required
        autoFocus
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
