import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui'
import { useClients } from '@/hooks/useClients'
import { useVetements } from '@/hooks/useVetements'

export default function CommandeForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { data: clients = [] } = useClients()
  const { data: vetements = [] } = useVetements()

  const [form, setForm] = useState({
    client_id:             initialData?.client_id              ?? '',
    vetement_id:           initialData?.vetement_id            ?? '',
    prix:                  String(initialData?.prix            ?? ''),
    acompte:               String(initialData?.acompte         ?? ''),
    date_livraison_prevue: initialData?.date_livraison_prevue?.slice(0, 10) ?? '',
    note_interne:          initialData?.note_interne           ?? '',
  })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      client_id:             form.client_id,
      vetement_id:           form.vetement_id,
      prix:                  Number(form.prix),
      acompte:               form.acompte !== '' ? Number(form.acompte) : 0,
      date_livraison_prevue: form.date_livraison_prevue || undefined,
      note_interne:          form.note_interne || undefined,
    })
  }

  const clientOptions  = clients.map(c  => ({ value: c.id,  label: `${c.prenom ?? ''} ${c.nom}`.trim() }))
  const vetOptions     = vetements.map(v => ({ value: v.id,  label: v.nom  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <Select label="Client" value={form.client_id} onChange={set('client_id')} options={clientOptions} placeholder="Choisir un client…" required />
      <Select label="Modèle / vêtement" value={form.vetement_id} onChange={set('vetement_id')} options={vetOptions} placeholder="Choisir un modèle…" required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Prix (XOF)" type="number" min="0" value={form.prix}    onChange={set('prix')}    placeholder="25000" required />
        <Input label="Acompte (XOF)" type="number" min="0" value={form.acompte} onChange={set('acompte')} placeholder="0" />
      </div>
      <Input label="Date de livraison" type="date" value={form.date_livraison_prevue} onChange={set('date_livraison_prevue')} />
      <Input label="Note interne" value={form.note_interne} onChange={set('note_interne')} placeholder="Instructions spéciales…" />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Enregistrer' : 'Créer la commande'}
        </Button>
      </div>
    </form>
  )
}
