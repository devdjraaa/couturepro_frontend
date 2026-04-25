import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, CreditCard, MessageCircle, Ruler, AlertTriangle } from 'lucide-react'
import { useCommande, useUpdateCommande, useUpdateStatutCommande, useDeleteCommande } from '@/hooks/useCommandes'
import { usePaiements, useEnregistrerPaiement } from '@/hooks/usePaiements'
import { useWhatsappRappel } from '@/hooks/useWhatsapp'
import { AppLayout } from '@/components/layout'
import { CommandeForm, StatutSelector } from '@/components/commandes'
import { Avatar, Button, BottomSheet, Skeleton, Input, Select } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const MODE_OPTIONS = [
  { value: 'especes',      label: 'Espèces'      },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'virement',     label: 'Virement'     },
]

export default function CommandeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const commandeId = id
  const [showEdit, setShowEdit] = useState(false)
  const [showPaiement, setShowPaiement] = useState(false)
  const [paiementForm, setPaiementForm] = useState({ montant: '', mode_paiement: 'especes' })

  const { data: commande, isLoading } = useCommande(commandeId)
  const { data: paiements = [] } = usePaiements({ commande_id: commandeId })
  const updateCommande = useUpdateCommande()
  const updateStatut = useUpdateStatutCommande()
  const deleteCommande = useDeleteCommande()
  const enregistrerPaiement = useEnregistrerPaiement()
  const whatsappRappel = useWhatsappRappel()

  const handleStatut = statut => updateStatut.mutate({ id: commandeId, statut })

  const handleUpdate = async data => {
    await updateCommande.mutateAsync({ id: commandeId, ...data })
    setShowEdit(false)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette commande ?')) return
    await deleteCommande.mutateAsync(commandeId)
    navigate('/commandes', { replace: true })
  }

  const handlePaiement = async e => {
    e.preventDefault()
    await enregistrerPaiement.mutateAsync({
      commandeId,
      montant: Number(paiementForm.montant),
      mode_paiement: paiementForm.mode_paiement,
    })
    setShowPaiement(false)
    setPaiementForm({ montant: '', mode_paiement: 'especes' })
  }

  if (isLoading) {
    return (
      <AppLayout showBack title="Commande">
        <div className="p-4 space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!commande) return null

  const restant = Math.max(0, (Number(commande.prix) ?? 0) - (Number(commande.acompte) ?? 0))

  return (
    <AppLayout
      showBack
      title="Commande"
      rightAction={
        <button onClick={() => setShowEdit(true)} className="p-2 text-dim">
          <Edit2 size={18} />
        </button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Urgence */}
        {commande.urgence && (
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-xl px-4 py-2.5">
            <AlertTriangle size={15} className="text-warning shrink-0" />
            <span className="text-sm font-semibold text-warning">Commande urgente</span>
          </div>
        )}

        {/* Client + vêtement */}
        <div className="bg-card border border-edge rounded-2xl p-4 flex items-center gap-3">
          <Avatar name={commande.client_nom} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate">{commande.client_nom}</p>
            <p className="text-sm text-dim">{commande.vetement_nom}</p>
          </div>
          {commande.date_livraison_prevue && (
            <p className="text-xs text-ghost shrink-0">{formatDate(commande.date_livraison_prevue)}</p>
          )}
        </div>

        {/* Photo tissu */}
        {commande.photo_tissu_url && (
          <div>
            <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">Tissu</p>
            <img
              src={commande.photo_tissu_url}
              alt="tissu"
              className="w-full rounded-2xl object-cover max-h-56 border border-edge"
            />
          </div>
        )}

        {/* Description */}
        {commande.description && (
          <div className="bg-card border border-edge rounded-2xl px-4 py-3">
            <p className="text-xs text-dim mb-1">Description</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{commande.description}</p>
          </div>
        )}

        {/* Statut */}
        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">Statut</p>
          <StatutSelector value={commande.statut} onChange={handleStatut} />
        </div>

        {/* Finances */}
        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">Montant total</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(commande.prix ?? 0)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">Avance versée</span>
            <span className="text-sm font-semibold text-success">{formatCurrency(commande.acompte ?? 0)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">Reste à payer</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(restant)}</span>
          </div>
        </div>

        {/* Historique paiements */}
        {paiements.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">Historique des paiements</p>
            <div className="space-y-2">
              {paiements.map(p => (
                <div key={p.id} className="bg-card border border-edge rounded-xl flex justify-between items-center px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{formatCurrency(p.montant)}</p>
                    <p className="text-xs text-ghost">{p.mode_paiement} · {formatDate(p.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {restant > 0 && (
            <Button icon={CreditCard} className="flex-1" onClick={() => setShowPaiement(true)}>
              Paiement
            </Button>
          )}
          {commande.client_id && (
            <Button
              variant="secondary"
              icon={MessageCircle}
              className={restant > 0 ? '' : 'w-full'}
              loading={whatsappRappel.isPending}
              onClick={() => whatsappRappel.mutate(commande.client_id)}
            >
              WhatsApp
            </Button>
          )}
        </div>

        {commande.note_interne && (
          <div className="bg-subtle rounded-xl px-4 py-3">
            <p className="text-xs text-dim mb-1">Note interne</p>
            <p className="text-sm text-ink">{commande.note_interne}</p>
          </div>
        )}

        {commande.client_id && (
          <Link to={`/clients/${commande.client_id}`} state={{ tab: 'mesures' }} className="flex items-center gap-2 text-primary text-sm py-2">
            <Ruler size={16} /> Voir les mesures du client
          </Link>
        )}

        <button onClick={handleDelete} className="flex items-center gap-2 text-danger text-sm py-2">
          <Trash2 size={16} /> Supprimer cette commande
        </button>
      </div>

      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier la commande">
        <CommandeForm
          initialData={commande}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={updateCommande.isPending}
        />
      </BottomSheet>

      <BottomSheet isOpen={showPaiement} onClose={() => setShowPaiement(false)} title="Enregistrer un paiement">
        <form onSubmit={handlePaiement} className="p-5 space-y-4">
          <Input
            label="Montant (XOF)"
            type="number"
            min="1"
            max={restant}
            value={paiementForm.montant}
            onChange={e => setPaiementForm(f => ({ ...f, montant: e.target.value }))}
            placeholder={String(restant)}
            required
          />
          <Select
            label="Mode de paiement"
            value={paiementForm.mode_paiement}
            onChange={e => setPaiementForm(f => ({ ...f, mode_paiement: e.target.value }))}
            options={MODE_OPTIONS}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowPaiement(false)} className="flex-1">Annuler</Button>
            <Button type="submit" loading={enregistrerPaiement.isPending} className="flex-1">Confirmer</Button>
          </div>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}
