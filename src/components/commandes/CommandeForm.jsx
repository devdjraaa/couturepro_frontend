import { useState, useRef } from 'react'
import { ImagePlus, X, AlertTriangle } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui'
import { useClients } from '@/hooks/useClients'
import { useVetements } from '@/hooks/useVetements'
import { cn } from '@/utils/cn'

const MODE_PAIEMENT_OPTIONS = [
  { value: 'especes',      label: 'Espèces'      },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'virement',     label: 'Virement'     },
]

export default function CommandeForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { data: clients = [] } = useClients()
  const { data: vetements = [] } = useVetements()
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    client_id:              initialData?.client_id                        ?? '',
    vetement_id:            initialData?.vetement_id                      ?? '',
    prix:                   String(initialData?.prix                      ?? ''),
    acompte:                String(initialData?.acompte                   ?? ''),
    mode_paiement_acompte:  initialData?.mode_paiement_acompte            ?? 'especes',
    date_livraison_prevue:  initialData?.date_livraison_prevue?.slice(0, 10) ?? '',
    note_interne:           initialData?.note_interne                     ?? '',
    description:            initialData?.description                      ?? '',
    urgence:                initialData?.urgence                          ?? false,
  })
  const [photoTissu, setPhotoTissu] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo_tissu_url ?? null)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoTissu(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoTissu(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const acompte = form.acompte !== '' ? Number(form.acompte) : 0
    onSubmit({
      client_id:              form.client_id,
      vetement_id:            form.vetement_id,
      prix:                   Number(form.prix),
      acompte,
      mode_paiement_acompte:  acompte > 0 ? form.mode_paiement_acompte : undefined,
      date_livraison_prevue:  form.date_livraison_prevue || undefined,
      note_interne:           form.note_interne || undefined,
      description:            form.description || undefined,
      urgence:                form.urgence,
      photo_tissu:            photoTissu ?? undefined,
    })
  }

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.prenom ?? ''} ${c.nom}`.trim() }))
  const vetOptions    = vetements.map(v => ({ value: v.id, label: v.nom }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <Select label="Client" value={form.client_id} onChange={set('client_id')} options={clientOptions} placeholder="Choisir un client…" required />
      <Select label="Modèle / vêtement" value={form.vetement_id} onChange={set('vetement_id')} options={vetOptions} placeholder="Choisir un modèle…" required />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Prix (XOF)" type="number" min="0" value={form.prix}    onChange={set('prix')}    placeholder="25000" required />
        <Input label="Acompte (XOF)" type="number" min="0" value={form.acompte} onChange={set('acompte')} placeholder="0" />
      </div>
      {Number(form.acompte) > 0 && !initialData && (
        <Select
          label="Mode de paiement de l'acompte"
          value={form.mode_paiement_acompte}
          onChange={set('mode_paiement_acompte')}
          options={MODE_PAIEMENT_OPTIONS}
        />
      )}

      <Input label="Date de livraison" type="date" value={form.date_livraison_prevue} onChange={set('date_livraison_prevue')} />

      {/* Photo du tissu */}
      <div>
        <p className="text-sm font-medium text-ink mb-2">Photo du tissu</p>
        {photoPreview ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-edge">
            <img src={photoPreview} alt="tissu" className="w-full h-full object-cover" />
            <button type="button" onClick={clearPhoto} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-6 rounded-xl border-2 border-dashed border-edge flex flex-col items-center justify-center gap-2 text-ghost hover:border-primary hover:text-primary transition-colors">
            <ImagePlus size={24} />
            <span className="text-xs">Photo du tissu ou modèle</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Description / instructions</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Ex : Col en V, boutons dorés, longueur genou…"
          rows={3}
          className="w-full bg-card border border-edge rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>

      <Input label="Note interne" value={form.note_interne} onChange={set('note_interne')} placeholder="Instructions pour l'équipe…" />

      {/* Urgence */}
      <button
        type="button"
        onClick={() => setForm(f => ({ ...f, urgence: !f.urgence }))}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
          form.urgence ? 'border-warning bg-warning/5 text-warning' : 'border-edge bg-card text-dim',
        )}
      >
        <AlertTriangle size={16} />
        <span className="text-sm font-medium">{form.urgence ? 'Commande urgente' : 'Marquer comme urgente'}</span>
      </button>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? 'Enregistrer' : 'Créer la commande'}
        </Button>
      </div>
    </form>
  )
}
