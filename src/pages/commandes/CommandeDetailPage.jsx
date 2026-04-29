import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Edit2, Trash2, CreditCard, MessageCircle, Ruler, AlertTriangle, Download, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCommande, useUpdateCommande, useUpdateStatutCommande, useDeleteCommande } from '@/hooks/useCommandes'
import { usePaiements, useEnregistrerPaiement } from '@/hooks/usePaiements'
import { useWhatsappRappel, useWhatsappCommandePrete } from '@/hooks/useWhatsapp'
import { useCommunications } from '@/hooks/useParametres'
import { useAuth } from '@/contexts'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { AppLayout } from '@/components/layout'
import { CommandeForm, StatutSelector } from '@/components/commandes'
import { Avatar, Button, BottomSheet, Skeleton, Input, Select } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { exportRelevePdf } from '@/utils/exportRelevePdf'

export default function CommandeDetailPage() {
  const { t } = useTranslation()

  const MODE_OPTIONS = [
    { value: 'especes',      label: t('commandes.modes_paiement.especes')      },
    { value: 'mobile_money', label: t('commandes.modes_paiement.mobile_money') },
    { value: 'virement',     label: t('commandes.modes_paiement.virement')     },
  ]
  const { id } = useParams()
  const navigate = useNavigate()
  const { atelier } = useAuth()
  const commandeId = id
  const [showEdit, setShowEdit] = useState(false)
  const [showPaiement, setShowPaiement] = useState(false)
  const [paiementForm, setPaiementForm] = useState({ montant: '', mode_paiement: 'especes' })
  const [whatsappUrl, setWhatsappUrl] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  const { data: commande, isLoading } = useCommande(commandeId)
  const { data: paiements = [] } = usePaiements({ commande_id: commandeId })
  const updateCommande = useUpdateCommande()
  const updateStatut = useUpdateStatutCommande()
  const deleteCommande = useDeleteCommande()
  const enregistrerPaiement = useEnregistrerPaiement()
  const whatsappRappel = useWhatsappRappel()
  const whatsappPrete = useWhatsappCommandePrete()
  const { data: commsConfig } = useCommunications()
  const { available: whatsappFactureAvailable } = usePlanFeature('facture_whatsapp')

  const handleStatut = async statut => {
    await updateStatut.mutateAsync({ id: commandeId, statut })
    if (statut === 'livre' && commsConfig?.whatsapp_enabled && commsConfig?.commande_prete) {
      whatsappPrete.mutate(commandeId)
    }
  }

  const handleUpdate = async data => {
    await updateCommande.mutateAsync({ id: commandeId, ...data })
    setShowEdit(false)
  }

  const handleDelete = async () => {
    if (!confirm(t('commandes.supprimer_confirm'))) return
    await deleteCommande.mutateAsync(commandeId)
    navigate('/commandes', { replace: true })
  }

  const handlePaiement = async e => {
    e.preventDefault()
    const result = await enregistrerPaiement.mutateAsync({
      commandeId,
      montant: Number(paiementForm.montant),
      mode_paiement: paiementForm.mode_paiement,
    })
    setShowPaiement(false)
    setPaiementForm({ montant: '', mode_paiement: 'especes' })
    if (result?.whatsapp_url) {
      setWhatsappUrl(result.whatsapp_url)
    }
  }

  const handleDownloadReleve = async () => {
    if (!commande || paiements.length === 0) return
    setExportingPdf(true)
    try {
      await exportRelevePdf({
        commande,
        paiements,
        clientNom: commande.client_nom ?? '',
        atelierNom: atelier?.nom ?? 'Couture Pro',
      })
    } finally {
      setExportingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout showBack title={t('commandes.detail.titre_single')}>
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
      title={t('commandes.detail.titre_single')}
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
            <span className="text-sm font-semibold text-warning">{t('commandes.detail.urgente')}</span>
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
            <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">{t('commandes.detail.tissu_label')}</p>
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
            <p className="text-xs text-dim mb-1">{t('commandes.detail.description_label')}</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{commande.description}</p>
          </div>
        )}

        {/* Statut */}
        <div>
          <p className="text-xs font-semibold text-dim uppercase tracking-wide mb-2">{t('commandes.detail.statut_label')}</p>
          <StatutSelector value={commande.statut} onChange={handleStatut} />
        </div>

        {/* Finances */}
        <div className="bg-card border border-edge rounded-2xl divide-y divide-edge">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">{t('commandes.detail.montant')}</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(commande.prix ?? 0)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">{t('commandes.detail.avance')}</span>
            <span className="text-sm font-semibold text-success">{formatCurrency(commande.acompte ?? 0)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-dim">{t('commandes.detail.reste')}</span>
            <span className="text-sm font-semibold text-ink">{formatCurrency(restant)}</span>
          </div>
        </div>

        {/* Historique paiements */}
        {paiements.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-dim uppercase tracking-wide">{t('commandes.detail.historique_paiements')}</p>
              <button
                onClick={handleDownloadReleve}
                disabled={exportingPdf}
                className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50"
              >
                <Download size={12} />
                {exportingPdf ? t('commandes.detail.export_encours') : t('commandes.detail.releve_pdf')}
              </button>
            </div>
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

        {/* Notification WhatsApp après paiement */}
        {whatsappUrl && (
          <div className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{t('commandes.detail.releve_pret')}</p>
              <p className="text-xs text-dim">{t('commandes.detail.envoyer_releve')}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="secondary"
                icon={Send}
                className="text-xs"
                onClick={() => { window.open(whatsappUrl, '_blank'); setWhatsappUrl(null) }}
              >
                {t('commandes.detail.envoyer')}
              </Button>
              <button onClick={() => setWhatsappUrl(null)} className="text-xs text-ghost">{t('commandes.detail.ignorer')}</button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {restant > 0 && (
            <Button icon={CreditCard} className="flex-1" onClick={() => setShowPaiement(true)}>
              {t('commandes.detail.paiement_btn')}
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
            <p className="text-xs text-dim mb-1">{t('commandes.detail.note_interne')}</p>
            <p className="text-sm text-ink">{commande.note_interne}</p>
          </div>
        )}

        {commande.client_id && (
          <Link to={`/clients/${commande.client_id}`} state={{ tab: 'mesures' }} className="flex items-center gap-2 text-primary text-sm py-2">
            <Ruler size={16} /> {t('commandes.detail.voir_mesures')}
          </Link>
        )}

        <button onClick={handleDelete} className="flex items-center gap-2 text-danger text-sm py-2">
          <Trash2 size={16} /> {t('commandes.detail.supprimer_btn')}
        </button>
      </div>

      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title={t('commandes.formulaire.titre_modification')}>
        <CommandeForm
          initialData={commande}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={updateCommande.isPending}
        />
      </BottomSheet>

      <BottomSheet isOpen={showPaiement} onClose={() => setShowPaiement(false)} title={t('commandes.paiement_form.titre')}>
        <form onSubmit={handlePaiement} className="p-5 space-y-4">
          <Input
            label={t('commandes.paiement_form.montant')}
            type="number"
            min="1"
            max={restant}
            value={paiementForm.montant}
            onChange={e => setPaiementForm(f => ({ ...f, montant: e.target.value }))}
            placeholder={String(restant)}
            required
          />
          <Select
            label={t('commandes.paiement_form.mode')}
            value={paiementForm.mode_paiement}
            onChange={e => setPaiementForm(f => ({ ...f, mode_paiement: e.target.value }))}
            options={MODE_OPTIONS}
          />
          {whatsappFactureAvailable && (
            <p className="text-xs text-dim">{t('commandes.paiement_form.releve_whatsapp')}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowPaiement(false)} className="flex-1">{t('commun.annuler')}</Button>
            <Button type="submit" loading={enregistrerPaiement.isPending} className="flex-1">{t('commun.confirmer')}</Button>
          </div>
        </form>
      </BottomSheet>
    </AppLayout>
  )
}
