import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Users, ClipboardList, AlertTriangle } from 'lucide-react'
import { AppLayout } from '@/components/layout'
import { StatsGrid, RecentCommandes } from '@/components/dashboard'
import { FloatingActionButton } from '@/components/ui'
import { useAuth } from '@/contexts'
import { useMesAteliers } from '@/hooks/useMesAteliers'

// ── Vue consolidée (propriétaire avec plusieurs ateliers, filtre "Tous") ──────
function ConsolidatedView({ ateliers, onSelect }) {
  const totals = ateliers.reduce(
    (acc, a) => ({
      clients:  acc.clients  + (a.clients_count  ?? 0),
      commandes: acc.commandes + (a.commandes_count ?? 0),
    }),
    { clients: 0, commandes: 0 }
  )

  return (
    <div className="space-y-4">
      {/* Résumé global */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={15} className="text-primary" />
            <span className="text-xs text-dim font-medium">Total clients</span>
          </div>
          <p className="text-2xl font-bold text-ink">{totals.clients}</p>
          <p className="text-xs text-ghost mt-0.5">tous ateliers</p>
        </div>
        <div className="bg-card border border-edge rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={15} className="text-warning" />
            <span className="text-xs text-dim font-medium">Total commandes</span>
          </div>
          <p className="text-2xl font-bold text-ink">{totals.commandes}</p>
          <p className="text-xs text-ghost mt-0.5">tous ateliers</p>
        </div>
      </div>

      {/* Liste par atelier */}
      <h2 className="text-sm font-semibold text-dim uppercase tracking-wide">
        Par atelier
      </h2>
      <div className="space-y-2">
        {ateliers.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full bg-card border border-edge rounded-2xl p-4 flex items-center gap-3 text-left hover:border-primary/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-ink truncate">{a.nom}</p>
                {a.is_maitre && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">Maître</span>
                )}
              </div>
              <p className="text-xs text-ghost mt-0.5">
                {a.clients_count ?? 0} clients · {a.commandes_count ?? 0} commandes
              </p>
            </div>
            <span className="text-xs text-primary font-medium shrink-0">Voir →</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Filtre ateliers ───────────────────────────────────────────────────────────
function AtelierFilter({ ateliers, activeId, onSelect, onAll, showAll }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      <button
        onClick={onAll}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          showAll ? 'bg-primary text-white' : 'bg-subtle text-dim'
        }`}
      >
        Tous
      </button>
      {ateliers.map(a => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !showAll && activeId === a.id ? 'bg-primary text-white' : 'bg-subtle text-dim'
          }`}
        >
          {a.is_maitre && <Building2 size={10} />}
          {a.nom}
        </button>
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, atelier, switchAtelier } = useAuth()
  const { data: ateliers = [] } = useMesAteliers()

  const isMulti       = user?.role === 'proprietaire' && ateliers.length > 1
  const [showAll, setShowAll] = useState(false)

  const handleSelect = (a) => {
    switchAtelier(a)
    setShowAll(false)
  }

  return (
    <AppLayout title="Accueil">
      <div className="p-4 space-y-4">

        {isMulti && (
          <AtelierFilter
            ateliers={ateliers}
            activeId={atelier?.id}
            onSelect={handleSelect}
            onAll={() => setShowAll(true)}
            showAll={showAll}
          />
        )}

        {isMulti && showAll ? (
          <ConsolidatedView
            ateliers={ateliers}
            onSelect={handleSelect}
          />
        ) : (
          <>
            <StatsGrid />
            <div>
              <h2 className="text-sm font-semibold text-dim uppercase tracking-wide mb-3">
                Commandes récentes
              </h2>
              <RecentCommandes />
            </div>
          </>
        )}
      </div>

      {!showAll && (
        <FloatingActionButton
          icon={Plus}
          onClick={() => navigate('/commandes/new')}
        />
      )}
    </AppLayout>
  )
}
