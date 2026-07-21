import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Edit2, Trash2, CreditCard, MessageCircle, Ruler,
  AlertTriangle, Download, Send, Phone, Check, Share2,
  Plus, CalendarDays, Trash, CheckCircle2, Clock, ClipboardList, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useCommande, useUpdateCommande, useUpdateStatutCommande, useDeleteCommande } from '@/hooks/useCommandes'
import { usePaiements, useEnregistrerPaiement } from '@/hooks/usePaiements'
import { useMesures } from '@/hooks/useMesures'
import { useCommandeItems, useDeleteCommandeItem } from '@/hooks/useCommandeItems'
import { useCommandeEcheances, useCreateEcheance, useUpdateEcheance, useDeleteEcheance } from '@/hooks/useCommandeEcheances'
import { useWhatsappRappel, useWhatsappCommandePrete } from '@/hooks/useWhatsapp'
import { useCommunications, useFactureSettings } from '@/hooks/useParametres'
import { useAuth } from '@/contexts'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { whatsappService } from '@/services/whatsappService'
import { commandeService } from '@/services/commandeService'
import { AppLayout } from '@/components/layout'
import { CommandeForm, StatutSelector } from '@/components/commandes'
import { FeatureGate } from '@/components/abonnement'
import { Avatar, Button, BottomSheet, Skeleton, Input, Select, StatusPill, CountdownBadge, MoneyAmount } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { exportRelevePdf } from '@/utils/exportRelevePdf'
import { exportFacturePdf, shareOrDownloadPdf } from '@/utils/exportFacturePdf'
import { cn } from '@/utils/cn'
import RessourceIntrouvable from '@/components/ui/RessourceIntrouvable'

// ── Onglets internes ──────────────────────────────────────────────────────────
const TABS = ['Aperçu', 'Paiements', 'Mesures', 'Historique']

function InternalTabs({ active, onChange }) {
  return (
    <div className="flex border-b border-edge overflow-x-auto scrollbar-none">
      {TABS.map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            active === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-ghost hover:text-ink',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ── Onglet Aperçu ─────────────────────────────────────────────────────────────
function TabApercu({ commande, onEdit, onStatut, onDelete, navigate }) {
  const { t } = useTranslation()

  const whatsappRappel = useWhatsappRappel()
  const whatsappPrete  = useWhatsappCommandePrete()
  const { data: commsConfig }         = useCommunications()
  const { data: items = [] }          = useCommandeItems(commande.id)
  const { data: echeances = [] }      = useCommandeEcheances(commande.id)
  const deleteItem                    = useDeleteCommandeItem(commande.id)
  const createEcheance                = useCreateEcheance(commande.id)
  const updateEcheance                = useUpdateEcheance(commande.id)
  const deleteEcheance                = useDeleteEcheance(commande.id)
  const [showEcheanceForm, setShowEcheanceForm] = useState(false)
  const [newEcheance, setNewEcheance] = useState({ date_echeance: '', note: '' })

  const TODAY = new Date().toISOString().split('T')[0]

  const handleStatut = async statut => {
    await onStatut(statut)
    if (statut === 'livre' && commsConfig?.whatsapp_enabled && commsConfig?.commande_prete) {
      whatsappPrete.mutate(commande.id)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Urgence */}
      {commande.urgence && (
        <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-xl px-4 py-2.5">
          <AlertTriangle size={14} className="text-warning shrink-0" />
          <span className="text-sm font-semibold text-warning">{t('commandes.creation.urgente')}</span>
        </div>
      )}

      {/* Carte client + délai */}
      <div className="bg-card border border-edge rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name={commande.client_nom} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate">{commande.client_nom}</p>
            <p className="text-sm text-ghost">{commande.vetement_nom}</p>
          </div>
          <StatusPill statut={commande.statut} />
        </div>
        {commande.date_livraison_prevue && (
          <div className="flex items-center justify-between pt-3 border-t border-edge">
            <span className="text-xs text-ghost">{t('commandes.groupe_form.livraison')}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink">{formatDate(commande.date_livraison_prevue)}</span>
              <CountdownBadge dueDate={commande.date_livraison_prevue} />
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="flex gap-2">
        {commande.client_id && (
          <button
            type="button"
            onClick={() => whatsappRappel.mutate(commande.client_id)}
            disabled={whatsappRappel.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#25d366]/10 border border-[#25d366]/30 text-[#1a9e4e] text-sm font-medium transition-colors hover:bg-[#25d366]/20 disabled:opacity-50"
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-subtle border border-edge text-ghost hover:text-ink text-sm font-medium transition-colors"
        >
          <Edit2 size={14} />
          Modifier
        </button>
      </div>

      {/* Photo tissu */}
      {commande.photo_tissu_url && (
        <div>
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">Tissu</p>
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
          <p className="text-xs text-ghost mb-1">Description</p>
          <p className="text-sm text-ink whitespace-pre-wrap">{commande.description}</p>
        </div>
      )}

      {/* Note interne */}
      {commande.note_interne && (
        <div className="bg-subtle rounded-xl px-4 py-3">
          <p className="text-xs text-ghost mb-1">{t('commandes.creation.note_interne')}</p>
          <p className="text-sm text-ink">{commande.note_interne}</p>
        </div>
      )}

      {/* #15, #18-20 — Articles de la commande */}
      {items.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">Articles</p>
          <div className="space-y-1.5">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-card border border-edge rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {item.vetement_nom ?? item.vetement?.nom ?? 'Article'}
                  </p>
                  <p className="text-xs text-ghost">
                    × {item.quantite} · {formatCurrency(item.prix_unitaire)} /unité
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold font-mono text-ink">
                    {formatCurrency(item.quantite * item.prix_unitaire)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteItem.mutate(item.id)}
                    className="text-ghost hover:text-error transition-colors"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* #21 — Échéances de livraison */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest">Échéances</p>
          <button
            type="button"
            onClick={() => setShowEcheanceForm(v => !v)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} /> Ajouter
          </button>
        </div>

        {showEcheanceForm && (
          <div className="bg-card border border-edge rounded-xl p-3 mb-2 space-y-2">
            <input
              type="date"
              min={TODAY}
              value={newEcheance.date_echeance}
              onChange={e => setNewEcheance(n => ({ ...n, date_echeance: e.target.value }))}
              className="w-full bg-subtle border border-edge rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={newEcheance.note}
              onChange={e => setNewEcheance(n => ({ ...n, note: e.target.value }))}
              placeholder="Note (ex : pantalons, veste…)"
              className="w-full bg-subtle border border-edge rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowEcheanceForm(false)}
                className="flex-1 text-xs text-ghost py-1.5 rounded-lg border border-edge"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!newEcheance.date_echeance || createEcheance.isPending}
                onClick={async () => {
                  await createEcheance.mutateAsync(newEcheance)
                  setNewEcheance({ date_echeance: '', note: '' })
                  setShowEcheanceForm(false)
                }}
                className="flex-1 text-xs text-primary font-semibold py-1.5 rounded-lg border border-primary/30 bg-primary-50 disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {echeances.length > 0 && (
          <div className="space-y-1.5">
            {echeances.map(ech => (
              <div
                key={ech.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border',
                  ech.livree ? 'bg-success/8 border-success/20' : 'bg-card border-edge',
                )}
              >
                <button
                  type="button"
                  onClick={() => updateEcheance.mutate({ id: ech.id, livree: !ech.livree })}
                  className={cn('shrink-0', ech.livree ? 'text-success' : 'text-ghost')}
                >
                  {ech.livree ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{formatDate(ech.date_echeance)}</p>
                  {ech.note && <p className="text-xs text-ghost truncate">{ech.note}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => deleteEcheance.mutate(ech.id)}
                  className="text-ghost hover:text-error transition-colors shrink-0"
                >
                  <Trash size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {echeances.length === 0 && (
          <p className="text-xs text-ghost">Aucune échéance. Ajoutez-en pour mieux planifier.</p>
        )}
      </div>

      {/* Changement de statut */}
      <div>
        <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">Statut</p>
        <StatutSelector value={commande.statut} onChange={handleStatut} />
      </div>

      <EtapeSuivi commande={commande} />

      {/* Mesures (lien) */}
      {commande.client_id && (
        <Link
          to={`/clients/${commande.client_id}`}
          state={{ tab: 'mesures' }}
          className="flex items-center gap-2 text-primary text-sm py-1"
        >
          <Ruler size={15} />
          Voir les mesures du client
        </Link>
      )}

      {/* Suppression */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-2 text-danger/70 hover:text-danger text-sm py-1 transition-colors"
      >
        <Trash2 size={14} />
        Supprimer la commande
      </button>
    </div>
  )
}

// ── Onglet Paiements ──────────────────────────────────────────────────────────
function TabPaiements({ commande, commandeId }) {
  const { t } = useTranslation()
  const { atelier, can, role, user }  = useAuth()
  const { data: paiements = [] } = usePaiements({ commande_id: commandeId })
  const { data: items = [] }     = useCommandeItems(commandeId)
  const { data: factureSettings } = useFactureSettings()
  const enregistrerPaiement = useEnregistrerPaiement()
  const { available: whatsappFactureAvailable } = usePlanFeature('facture_whatsapp')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ montant: '', mode_paiement: 'especes' })
  const [whatsappUrl, setWhatsappUrl] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingFacture, setExportingFacture] = useState(null)

  const MODE_OPTIONS = [
    { value: 'especes',      label: t('commandes.modes_paiement.especes')      },
    { value: 'mobile_money', label: t('commandes.modes_paiement.mobile_money') },
    { value: 'virement',     label: t('commandes.modes_paiement.virement')     },
  ]

  const prix    = Number(commande.prix    ?? 0)
  const acompte = Number(commande.acompte ?? 0)
  const restant = Math.max(0, prix - acompte)
  const paidPct = prix > 0 ? Math.min(100, (acompte / prix) * 100) : 0
  const solde   = paidPct >= 100

  const handlePaiement = async (e) => {
    e.preventDefault()
    const result = await enregistrerPaiement.mutateAsync({
      commandeId,
      montant: Number(form.montant),
      mode_paiement: form.mode_paiement,
    })
    setShowForm(false)
    setForm({ montant: '', mode_paiement: 'especes' })
    if (result?.whatsapp_url) setWhatsappUrl(result.whatsapp_url)
  }

  const handleDownload = async () => {
    if (!commande || paiements.length === 0) return
    setExportingPdf(true)
    try {
      await exportRelevePdf({ commande, paiements, clientNom: commande.client_nom ?? '', atelierNom: atelier?.nom ?? 'Gextimo' })
    } finally {
      setExportingPdf(false)
    }
  }

  const handleFacture = async (mode) => {
    setExportingFacture(mode)
    // P81 : message explicite pendant la génération (l'utilisateur sait ce qui se passe)
    const progressToast = toast.loading(t('facturation.doc.facture_generation'))
    try {
      const { pdf, filename } = await exportFacturePdf({ commande, items, client: commande.client, atelier, factureSettings, contact: { telephone: user?.telephone, email: user?.email } })
      toast.dismiss(progressToast)
      const result = await shareOrDownloadPdf(pdf, filename, {
        title: `Facture : ${commande.client_nom}`,
        text: `Facture pour ${commande.client_nom}`,
      })
      if (result === 'downloaded') toast.success('Facture téléchargée.')
    } catch {
      toast.dismiss(progressToast)
      toast.error("Impossible de générer la facture.")
    } finally {
      setExportingFacture(null)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Résumé financier */}
      <div className="bg-card border border-edge rounded-2xl overflow-hidden">
        <div className="divide-y divide-edge">
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-ghost">{t('commandes.prix_total')}</span>
            <span className="text-sm font-semibold text-ink font-mono">{formatCurrency(prix)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-ghost">{t('commandes.deja_encaisse')}</span>
            <span className="text-sm font-semibold text-success font-mono">{formatCurrency(acompte)}</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm font-medium text-ink">{t('commandes.groupe.reste')}</span>
            <span className={cn('text-lg font-bold font-mono', solde ? 'text-success' : 'text-gold-dark')}>
              {formatCurrency(restant)}
            </span>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="h-2 rounded-full bg-subtle overflow-hidden">
            <div
              className={cn('h-full rounded-full', solde ? 'bg-success' : 'bg-primary')}
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA encaissement */}
      {restant > 0 && !showForm && (
        <Button icon={CreditCard} onClick={() => setShowForm(true)} className="w-full">
          Enregistrer un paiement
        </Button>
      )}

      {/* Formulaire inline */}
      {showForm && (
        <form onSubmit={handlePaiement} className="bg-card border border-edge rounded-2xl p-4 space-y-3">
          <Input
            label="Montant (XOF)"
            type="number"
            min="1"
            max={restant}
            value={form.montant}
            onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
            placeholder={String(restant)}
            required
          />
          <Select
            label="Mode de paiement"
            value={form.mode_paiement}
            onChange={e => setForm(f => ({ ...f, mode_paiement: e.target.value }))}
            options={MODE_OPTIONS}
          />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Annuler</Button>
            <Button type="submit" loading={enregistrerPaiement.isPending} className="flex-1">Confirmer</Button>
          </div>
        </form>
      )}

      {/* WhatsApp reçu */}
      {whatsappUrl && (
        <div className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{t('commandes.detail.releve_pret')}</p>
            <p className="text-xs text-ghost">Envoyer le récap WhatsApp ?</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" icon={Send} className="text-xs" onClick={() => { window.open(whatsappUrl, '_blank'); setWhatsappUrl(null) }}>
              Envoyer
            </Button>
            <button type="button" onClick={() => setWhatsappUrl(null)} className="text-xs text-ghost">Ignorer</button>
          </div>
        </div>
      )}

      {/* Historique paiements */}
      {paiements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-ghost uppercase tracking-widest">Historique</p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={exportingPdf}
              className="flex items-center gap-1 text-xs text-primary font-medium disabled:opacity-50"
            >
              <Download size={12} />
              {exportingPdf ? 'Export…' : 'Relevé PDF'}
            </button>
          </div>
          <div className="space-y-2">
            {paiements.map(p => (
              <div key={p.id} className="bg-card border border-edge rounded-xl flex justify-between items-center px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink font-mono">{formatCurrency(p.montant)}</p>
                  <p className="text-xs text-ghost">{p.mode_paiement} · {formatDate(p.created_at)}</p>
                </div>
                <Check size={14} className="text-success" />
              </div>
            ))}
          </div>
        </div>
      )}

      {paiements.length === 0 && solde && (
        <p className="text-xs text-ghost text-center py-4">Aucun paiement enregistré séparément.</p>
      )}

      {/* Facture */}
      {(can('factures.generate') || role === 'proprietaire') && (
        <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Facture</p>

          {can('factures.generate') && (
            <Button
              icon={Share2}
              variant="secondary"
              loading={exportingFacture === 'partage'}
              onClick={() => handleFacture('partage')}
              className="w-full"
            >
              Enregistrer / Partager
            </Button>
          )}

          {role === 'proprietaire' && (
            whatsappFactureAvailable ? (
              <button
                type="button"
                onClick={() => handleFacture('whatsapp')}
                disabled={exportingFacture === 'whatsapp'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#25d366]/40 bg-[#25d366]/8 text-[#1a9e4e] text-sm font-medium hover:bg-[#25d366]/15 transition-colors disabled:opacity-50"
              >
                <MessageCircle size={15} />
                {exportingFacture === 'whatsapp' ? 'Préparation…' : 'Envoyer la facture par WhatsApp'}
              </button>
            ) : (
              <FeatureGate
                featureKey="facture_whatsapp"
                featureName="L'envoi de factures par WhatsApp"
                variant="inline"
              />
            )
          )}
        </div>
      )}

      {/* #78-82 — Reçu complet WhatsApp */}
      {commande.client_id && (
        <button
          type="button"
          onClick={async () => {
            try {
              const { lien } = await whatsappService.getPreuvePaiement(commandeId)
              window.open(lien, '_blank', 'noopener,noreferrer')
            } catch {}
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#25d366]/40 bg-[#25d366]/8 text-[#1a9e4e] text-sm font-medium hover:bg-[#25d366]/15 transition-colors"
        >
          <MessageCircle size={15} />
          Envoyer le reçu complet par WhatsApp
        </button>
      )}
    </div>
  )
}

// ── Onglet Mesures ────────────────────────────────────────────────────────────
const MESURE_LABELS = {
  poitrine:       'Poitrine',
  taille:         'Tour de taille',
  hanches:        'Hanches',
  epaule:         'Épaule',
  longueur_dos:   'Longueur dos',
  longueur_bras:  'Longueur bras',
  tour_cou:       'Tour de cou',
  tour_poignet:   'Tour de poignet',
  longueur_robe:  'Longueur robe',
  longueur_pantalon: 'Longueur pantalon',
  tour_cuisse:    'Tour de cuisse',
  tour_cheville:  'Tour de cheville',
}

function TabMesures({ commande }) {
  const { data: mesures = {}, isLoading } = useMesures(commande.client_id)
  const entries = Object.entries(mesures).filter(([, v]) => v != null && v !== '')

  if (!commande.client_id) {
    return (
      <div className="p-4">
        <p className="text-sm text-ghost text-center py-8">Aucun client associé.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-ghost text-center py-8">Aucune mesure enregistrée pour ce client.</p>
        <div className="text-center">
          <Link to={`/clients/${commande.client_id}`} state={{ tab: 'mesures' }} className="text-sm text-primary underline">
            Saisir les mesures →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-card border border-edge rounded-xl px-3 py-3">
            <p className="text-2xs text-ghost uppercase tracking-wide mb-0.5">
              {MESURE_LABELS[key] ?? key}
            </p>
            <p className="text-sm font-semibold text-ink font-mono">{value} cm</p>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link to={`/clients/${commande.client_id}`} state={{ tab: 'mesures' }} className="text-xs text-primary">
          Mettre à jour les mesures →
        </Link>
      </div>
    </div>
  )
}

// ── Onglet Historique ─────────────────────────────────────────────────────────
function TabHistorique({ commande, paiements }) {
  const { t } = useTranslation()

  // Icônes lucide et libellés traduits : la frise portait trois emoji et trois
  // phrases françaises en clair, invisibles pour la version anglaise.
  const events = [
    { date: commande.created_at, label: t('commandes.frise.creee'), Icone: ClipboardList },
    ...paiements.map(p => ({
      date: p.created_at,
      label: t('commandes.frise.payee', { montant: formatCurrency(p.montant), mode: p.mode_paiement }),
      Icone: Wallet,
    })),
    commande.date_livraison_effective && {
      date: commande.date_livraison_effective,
      label: t('commandes.frise.livree'),
      Icone: CheckCircle2,
    },
  ].filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="p-4">
      <div className="relative pl-6 space-y-4">
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-edge" />
        {events.map((ev, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[18px] w-4 h-4 rounded-full bg-card border border-edge flex items-center justify-center">
              <ev.Icone size={9} className="text-dim" aria-hidden="true" />
            </div>
            <p className="text-sm text-ink">{ev.label}</p>
            <p className="text-xs text-ghost mt-0.5">{formatDate(ev.date)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CommandeDetailPage() {
  const { t }            = useTranslation()
  const { id }           = useParams()
  const navigate         = useNavigate()
  const commandeId       = id
  const [tab, setTab]    = useState('Aperçu')
  const [showEdit, setShowEdit] = useState(false)

  const { data: commande, isLoading } = useCommande(commandeId)
  const { data: paiements = [] }      = usePaiements({ commande_id: commandeId })
  const updateCommande  = useUpdateCommande()
  const updateStatut    = useUpdateStatutCommande()
  const deleteCommande  = useDeleteCommande()

  const handleUpdate = async data => {
    await updateCommande.mutateAsync({ id: commandeId, ...data })
    setShowEdit(false)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cette commande ?')) return
    await deleteCommande.mutateAsync(commandeId)
    navigate('/commandes', { replace: true })
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

  // Identifiant inconnu (lien périmé, élément supprimé, adresse tapée à la
  // main) : on renvoyait `null`, donc un écran BLANC sans même un retour.
  if (!commande) {
    return (
      <AppLayout showBack title={t('erreurs.introuvable_titre')}>
        <RessourceIntrouvable />
      </AppLayout>
    )
  }

  return (
    <AppLayout showBack title={commande.vetement_nom ?? 'Commande'}>
      <InternalTabs active={tab} onChange={setTab} />

      <div className="overflow-y-auto">
        {tab === 'Aperçu' && (
          <TabApercu
            commande={commande}
            onEdit={() => setShowEdit(true)}
            onStatut={s => updateStatut.mutateAsync({ id: commandeId, statut: s })}
            onDelete={handleDelete}
            navigate={navigate}
          />
        )}
        {tab === 'Paiements' && (
          <TabPaiements commande={commande} commandeId={commandeId} />
        )}
        {tab === 'Mesures' && (
          <TabMesures commande={commande} />
        )}
        {tab === 'Historique' && (
          <TabHistorique commande={commande} paiements={paiements} />
        )}
      </div>

      <BottomSheet isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier la commande">
        <CommandeForm
          initialData={commande}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={updateCommande.isPending}
        />
      </BottomSheet>
    </AppLayout>
  )
}

const ETAPES = [
  { v: 'commande',   l: 'Commande' },
  { v: 'coupe',      l: 'Coupe' },
  { v: 'confection', l: 'Confection' },
  { v: 'essayage',   l: 'Essayage' },
  { v: 'livraison',  l: 'Livraison' },
]

function EtapeSuivi({ commande }) {
  const { t } = useTranslation()

  const [etape, setEtape] = useState(commande.etape || 'commande')
  const [saved, setSaved] = useState(false)
  const onChange = async (e) => {
    const v = e.target.value
    setEtape(v)
    setSaved(false)
    try {
      await commandeService.setEtape(commande.id, v)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch { /* erreur silencieuse */ }
  }
  return (
    <div>
      <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">
        Suivi vitrine{commande.reference ? <span className="text-primary normal-case"> · {commande.reference}</span> : null}
      </p>
      <div className="flex items-center gap-2">
        <select value={etape} onChange={onChange} className="rounded-lg border border-edge bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30">
          {ETAPES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
        {saved && <span className="text-xs text-success font-medium inline-flex items-center gap-1"><Check size={12} aria-hidden="true" />{t('commun.enregistre')}</span>}
      </div>
    </div>
  )
}
