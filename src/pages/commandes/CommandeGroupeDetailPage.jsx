import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, MessageCircle, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCommandeGroupe } from '@/hooks/useCommandeGroupes'
import { useFactureSettings } from '@/hooks/useParametres'
import { usePlanFeature } from '@/hooks/usePlanFeature'
import { useAuth } from '@/contexts'
import { AppLayout } from '@/components/layout'
import { Avatar, Skeleton, StatusPill, Button } from '@/components/ui'
import { FeatureGate } from '@/components/abonnement'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { exportFactureGroupePdf, shareOrDownloadPdf } from '@/utils/exportFacturePdf'
import { toCommandeDetail } from '@/constants/routes'
import { cn } from '@/utils/cn'

export default function CommandeGroupeDetailPage() {
  const { id } = useParams()
  const { data: groupe, isLoading } = useCommandeGroupe(id)
  const { data: factureSettings }   = useFactureSettings()
  const { available: whatsappFactureAvailable } = usePlanFeature('facture_whatsapp')
  const { atelier, can, role } = useAuth()

  const [exporting, setExporting] = useState(null)

  const handleShare = async (mode) => {
    if (!groupe) return
    setExporting(mode)
    try {
      const { pdf, filename } = await exportFactureGroupePdf({ groupe, atelier, factureSettings })
      const result = await shareOrDownloadPdf(pdf, filename, {
        title: `Facture — ${groupe.client_nom}`,
        text: `Facture commande groupée pour ${groupe.client_nom}`,
      })
      if (result === 'downloaded') toast.success('Facture téléchargée.')
    } catch {
      toast.error("Impossible de générer la facture.")
    } finally {
      setExporting(null)
    }
  }

  if (isLoading) {
    return (
      <AppLayout showBack title="Commande groupée">
        <div className="p-4 space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!groupe) return null

  const canGenerateFacture = can('factures.generate')

  return (
    <AppLayout showBack title="Commande groupée">
      <div className="p-4 space-y-4">
        {/* Carte client + totaux */}
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={groupe.client_nom} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink truncate">{groupe.client_nom}</p>
              <p className="text-xs text-ghost">{groupe.commandes?.length ?? 0} article(s) · {formatDate(groupe.created_at)}</p>
            </div>
          </div>

          <div className="divide-y divide-edge border-t border-edge">
            <div className="flex justify-between py-2">
              <span className="text-sm text-ghost">Total général</span>
              <span className="text-sm font-semibold text-ink font-mono">{formatCurrency(groupe.total_general)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-ghost">Acomptes reçus</span>
              <span className="text-sm font-semibold text-success font-mono">{formatCurrency(groupe.acompte_total)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-ink">Reste à payer</span>
              <span className={cn('text-lg font-bold font-mono', groupe.reste_total === 0 ? 'text-success' : 'text-gold-dark')}>
                {formatCurrency(groupe.reste_total)}
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        {groupe.note && (
          <div className="bg-subtle rounded-xl px-4 py-3">
            <p className="text-xs text-ghost mb-1">Note</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{groupe.note}</p>
          </div>
        )}

        {/* Sous-commandes */}
        <div>
          <p className="text-xs font-semibold text-ghost uppercase tracking-widest mb-2">
            Articles de la commande
          </p>
          <div className="space-y-1.5">
            {(groupe.commandes ?? []).map(c => (
              <Link
                key={c.id}
                to={toCommandeDetail(c.id)}
                className="flex items-center gap-3 bg-card border border-edge rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{c.vetement_nom ?? c.vetement?.nom ?? 'Article'}</p>
                  <p className="text-xs text-ghost">
                    × {c.quantite} · {formatCurrency(c.prix)}
                    {c.date_livraison_prevue && ` · ${formatDate(c.date_livraison_prevue)}`}
                  </p>
                </div>
                <StatusPill kind={c.statut} />
                <ChevronRight size={15} className="text-ghost shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Facture */}
        <div className="bg-card border border-edge rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">Facture</p>

          {canGenerateFacture ? (
            <Button
              icon={Share2}
              variant="secondary"
              loading={exporting === 'partage'}
              onClick={() => handleShare('partage')}
              className="w-full"
            >
              Enregistrer / Partager
            </Button>
          ) : (
            <p className="text-xs text-ghost">
              Vous n'avez pas la permission de générer des factures pour cet atelier.
            </p>
          )}

          {role === 'proprietaire' && (
            whatsappFactureAvailable ? (
              <button
                type="button"
                onClick={() => handleShare('whatsapp')}
                disabled={exporting === 'whatsapp'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#25d366]/40 bg-[#25d366]/8 text-[#1a9e4e] text-sm font-medium hover:bg-[#25d366]/15 transition-colors disabled:opacity-50"
              >
                <MessageCircle size={15} />
                {exporting === 'whatsapp' ? 'Préparation…' : 'Envoyer par WhatsApp'}
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
      </div>
    </AppLayout>
  )
}
