import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, History } from 'lucide-react'
import { useAuth } from '@/contexts'
import { exportMesuresPdf } from '@/utils/exportMesuresPdf'
import { mesureService } from '@/services/mesureService'
import { BottomSheet } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'

const toLabel = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function MesureDisplay({ mesures, clientNom, atelierNom, clientId }) {
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)
  const [histoOpen, setHistoOpen] = useState(false)
  const [histo, setHisto] = useState(null) // null = pas chargé, [] = chargé vide
  const [histoLoading, setHistoLoading] = useState(false)
  const { atelier } = useAuth()
  const uniteMesure = atelier?.unite_mesure ?? 'cm'

  // P74 : historique versionné (chargé en ligne à l'ouverture de la sheet).
  const openHistorique = async () => {
    setHistoOpen(true)
    if (histo !== null || !clientId) return
    setHistoLoading(true)
    try {
      setHisto(await mesureService.getHistorique(clientId))
    } catch {
      setHisto([])
    } finally {
      setHistoLoading(false)
    }
  }

  if (!mesures) return null

  const entries = Object.entries(mesures).filter(([k, v]) => k !== 'notes' && v != null)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportMesuresPdf(clientNom ?? 'client', mesures, atelierNom, uniteMesure)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="p-5">
        {entries.length === 0 ? (
          <p className="text-sm text-ghost text-center py-4">{t('mesures.aucune_enregistree')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {entries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between border-b border-edge pb-2">
                <span className="text-xs text-dim">{toLabel(key)}</span>
                <span className="text-sm font-semibold text-ink font-mono">{value} {uniteMesure}</span>
              </div>
            ))}
          </div>
        )}
        {mesures.notes && (
          <p className="mt-4 text-sm text-dim bg-subtle rounded-xl px-3 py-2 italic">{mesures.notes}</p>
        )}
      </div>

      {entries.length > 0 && clientNom && (
        <div className="px-5 pb-4 flex items-center gap-5">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 text-sm text-primary font-medium disabled:opacity-50"
          >
            <Download size={15} />
            {exporting ? 'Génération…' : 'Exporter en PDF'}
          </button>
          {clientId && (
            <button
              type="button"
              onClick={openHistorique}
              className="flex items-center gap-2 text-sm text-dim font-medium"
            >
              <History size={15} />
              Historique
            </button>
          )}
        </div>
      )}

      {/* P74 — Historique versionné des mesures */}
      <BottomSheet isOpen={histoOpen} onClose={() => setHistoOpen(false)} title="Historique des mesures">
        {histoLoading ? (
          <p className="text-sm text-dim text-center py-6">Chargement…</p>
        ) : !histo || histo.length === 0 ? (
          <p className="text-sm text-ghost text-center py-6">
            Aucun historique disponible{histo === null ? ' (connexion requise)' : ''}.
          </p>
        ) : (
          <div className="space-y-3 pb-2">
            {histo.map(v => {
              const champs = Object.entries(v.champs ?? {}).filter(([k, val]) => k !== 'notes' && val != null)
              return (
                <div key={v.id} className="bg-subtle rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink">Version {v.version}</span>
                    <span className="text-xs text-dim">{v.date ? formatDate(v.date) : ''}</span>
                  </div>
                  <p className="text-[11px] text-ghost mb-2">
                    {v.atelier}{v.auteur ? ` · ${v.auteur}` : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {champs.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-[11px] text-dim">{toLabel(key)}</span>
                        <span className="text-xs font-mono text-ink">{value} {uniteMesure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
