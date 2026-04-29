import { useState } from 'react'
import { Download, TrendingUp, Clock, CheckCircle, Wallet } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { useCaisseStats, useCaisseClients } from '@/hooks/useCaisse'
import { FeatureGate } from '@/components/abonnement'
import { useAuth } from '@/contexts'
import { exportRapportCaissePdf } from '@/utils/exportRapportCaissePdf'

const fmt = (v) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(v) || 0) + ' FCFA'

const MOIS_OPTIONS = (() => {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    opts.push({ value, label })
  }
  return opts
})()

function StatCard({ icon: Icon, label, value, sub, bg, textColor, iconBg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex gap-3 items-start`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={16} className={textColor} />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-semibold ${textColor} mb-0.5`}>{label}</p>
        <p className={`text-lg font-bold ${textColor} leading-tight`}>{value}</p>
        {sub && <p className="text-xs text-dim mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const MODE_LABELS = {
  especes: 'Espèces',
  mobile_money: 'Mobile Money',
  virement: 'Virement',
}

function CaisseContent() {
  const { user } = useAuth()
  const [mois, setMois] = useState(MOIS_OPTIONS[0].value)
  const [exporting, setExporting] = useState(false)

  const { data: stats, isLoading: statsLoading } = useCaisseStats(mois)
  const { data: clients = [], isLoading: clientsLoading } = useCaisseClients()

  const isLoading = statsLoading || clientsLoading

  const handleExport = async () => {
    if (!stats) return
    setExporting(true)
    try {
      await exportRapportCaissePdf({
        stats,
        clients,
        atelierNom: user?.atelier?.nom ?? 'Couture Pro',
      })
    } finally {
      setExporting(false)
    }
  }

  const debiteurs = clients.filter(c => c.solde_restant > 0)
  const modes = Object.entries(stats?.modes_paiement ?? {})

  return (
    <div className="px-4 pb-8 space-y-6 mt-2">

      {/* Sélecteur de mois + export */}
      <div className="flex items-center gap-3">
        <select
          value={mois}
          onChange={e => setMois(e.target.value)}
          className="flex-1 text-sm bg-card border border-edge rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {MOIS_OPTIONS.map(o => (
            <option key={o.value} value={o.value} className="capitalize">{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleExport}
          disabled={exporting || isLoading || !stats}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 shrink-0"
        >
          <Download size={14} />
          {exporting ? '…' : 'PDF'}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-subtle animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={TrendingUp}
              label="Total encaissé"
              value={fmt(stats.total_encaisse)}
              bg="bg-green-50"
              textColor="text-green-700"
              iconBg="bg-green-100"
            />
            <StatCard
              icon={Clock}
              label="En attente"
              value={fmt(stats.total_en_attente)}
              bg="bg-amber-50"
              textColor="text-amber-700"
              iconBg="bg-amber-100"
            />
            <StatCard
              icon={CheckCircle}
              label="Soldées"
              value={String(stats.nb_commandes_soldees)}
              sub="commandes"
              bg="bg-primary/5"
              textColor="text-primary"
              iconBg="bg-primary/10"
            />
            <StatCard
              icon={Wallet}
              label="En cours"
              value={String(stats.nb_commandes_en_cours)}
              sub="commandes"
              bg="bg-sky-50"
              textColor="text-sky-700"
              iconBg="bg-sky-100"
            />
          </div>

          {/* Modes de paiement */}
          {modes.length > 0 && (
            <div className="bg-card border border-edge rounded-2xl p-4">
              <p className="text-sm font-semibold text-ink mb-3">Encaissements par mode</p>
              <div className="space-y-2">
                {modes.map(([mode, total]) => (
                  <div key={mode} className="flex items-center justify-between">
                    <span className="text-sm text-dim">{MODE_LABELS[mode] ?? mode}</span>
                    <span className="text-sm font-semibold text-ink">{fmt(total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients débiteurs */}
          <div>
            <p className="text-sm font-semibold text-ink mb-3">
              Soldes clients
              {debiteurs.length > 0 && (
                <span className="ml-2 text-xs font-normal text-dim">{debiteurs.length} débiteur{debiteurs.length > 1 ? 's' : ''}</span>
              )}
            </p>

            {debiteurs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 bg-card border border-edge rounded-2xl">
                <CheckCircle size={28} className="text-green-500" />
                <p className="text-sm text-dim">Aucun solde en attente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {debiteurs.map(c => (
                  <div key={c.id} className="bg-card border border-edge rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{c.prenom} {c.nom}</p>
                        {c.telephone && (
                          <p className="text-xs text-ghost mt-0.5">{c.telephone}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-danger">{fmt(c.solde_restant)}</p>
                        <p className="text-xs text-ghost">reste dû</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 pt-2 border-t border-edge">
                      <div className="flex-1">
                        <p className="text-[10px] text-ghost uppercase tracking-wide">Total</p>
                        <p className="text-xs font-medium text-ink">{fmt(c.total_commande)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-ghost uppercase tracking-wide">Versé</p>
                        <p className="text-xs font-medium text-green-600">{fmt(c.total_paye)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-ghost uppercase tracking-wide">Commandes</p>
                        <p className="text-xs font-medium text-ink">{c.nb_commandes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default function CaissePage() {
  return (
    <AppLayout title="Caisse" showBack>
      <FeatureGate featureKey="module_caisse" featureName="Module Caisse">
        <CaisseContent />
      </FeatureGate>
    </AppLayout>
  )
}
