import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui'
import { useClients } from '@/hooks/useClients'
import { useVetements } from '@/hooks/useVetements'

export default function CommandeForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { data: clients = [] } = useClients()
  const { data: vetements = [] } = useVetements()

  const [form, setForm] = useState({
    client_id:      String(initialData?.client_id      ?? ''),
    vetement_id:    String(initialData?.vetement_id    ?? ''),
    montant:        String(initialData?.montant        ?? ''),
    avance:         String(initialData?.avance         ?? ''),
    date_livraison: initialData?.date_livraison?.slice(0, 10) ?? '',
    notes:          initialData?.notes                 ?? '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      client_id:   Number(form.client_id),
      vetement_id: Number(form.vetement_id),
      montant:     Number(form.montant),
      avance:      Number(form.avance) || 0,
    })
  }

  const clientOptions  = clients.map(c  => ({ value: String(c.id),  label: c.nom  }))
  const vetOptions     = vetements.map(v => ({ value: String(v.id),  label: v.nom  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <Select label="Client" value={form.client_id} onChange={set('client_id')} options={clientOptions} required />
      <Select label="Type de vêtement" value={form.vetement_id} onChange={set('vetement_id')} options={vetOptions} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Montant (XOF)" type="number" min="0" value={form.montant} onChange={set('montant')} placeholder="25000" required />
        <Input label="Avance (XOF)"  type="number" min="0" value={form.avance}  onChange={set('avance')}  placeholder="0" />
      </div>
      <Input label="Date de livraison" type="date" value={form.date_livraison} onChange={set('date_livraison')} required />
      <Input label="Notes" value={form.notes} onChange={set('notes')} placeholder="Instructions spéciales…" />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Enregistrer' : 'Créer la commande'}
        </Button>
      </div>
    </form>
  )
}
