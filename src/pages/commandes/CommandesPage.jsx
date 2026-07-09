import { useState, useMemo } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  ClipboardList, LayoutList, Columns2,
  X, AlertTriangle, Timer, Zap, Banknote, Calendar,
} from 'lucide-react'
import { isPast, parseISO, isThisWeek, isToday } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useCommandes } from '@/hooks/useCommandes'
import { AppLayout } from '@/components/layout'
import { CommandeCard } from '@/components/commandes'
import { EmptyState, Skeleton, Button, SearchBar } from '@/components/ui'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

// ── Colonnes pipeline ─────────────────────────────────────────────────────────
const PIPELINE_COLS = [
  { key: 'en_cours', tKey: 'commandes.statut.en_cours',  color: 'text-primary'  },
  { key: 'essai',    tKey: 'commandes.pipeline.essayage', color: 'text-warning'  },
  { key: 'livre',    tKey: 'commandes.onglets.livrees',   color: 'text-success'  },
]

function PipelineColumn({ col, commandes, navigate }) {
  const { t } = useTranslation()
  const total   = commandes.reduce((s, c) => s + Math.max(0, (c.prix ?? 0) - (c.acompte ?? 0)), 0)

  return (
    <div className="flex-none w-[280px] flex flex-col">
      {/* En-tête colonne */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-semibold', col.color)}>{t(col.tKey)}</span>
          <span className="text-xs font-medium text-ghost bg-subtle px-1.5 py-0.5 rounded-full">
            {commandes.length}
          </span>
        </div>
        {total > 0 && (
          <span className="text-xs font-mono text-gold-dark">{formatCurrency(total)}</span>
        )}
      </div>

      {/* Cartes */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4 pr-1">
        {commandes.length === 0 ? (
          <div className="py-8 text-center text-xs text-ghost border border-dashed border-edge rounded-2xl">
            {t('commandes.pipeline.vide')}
          </div>
        ) : (
          commandes.map(cmd => (
            <CommandeCard
              key={cmd.id}
              commande={cmd}
              onClick={() => navigate(`/commandes/${cmd.id}`)}
              compact
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Vue liste chronologique ───────────────────────────────────────────────────
function groupByDate(commandes) {
  const today    = []
  const tomorrow = []
  const week     = []
  const later    = []
  const past     = []
  const noDate   = []

  const now  = new Date()
  const todayStr = now.toDateString()
  const tomorrowStr = new Date(now.getTime() + 86400000).toDateString()

  commandes.forEach(c => {
    if (!c.date_livraison_prevue) { noDate.push(c); return }
    const d = parseISO(c.date_livraison_prevue)
    const ds = d.toDateString()
    if (isPast(d) && !isToday(d)) { past.push(c); return }
    if (ds === todayStr)          { today.push(c); return }
    if (ds === tomorrowStr)       { tomorrow.push(c); return }
    if (isThisWeek(d, { weekStartsOn: 1 })) { week.push(c); return }
    later.push(c)
  })

  return [
    past.length     && { labelKey: 'commandes.groupes.retard',    items: past,     danger: true },
    today.length    && { labelKey: 'commandes.groupes.auj',       items: today              },
    tomorrow.length && { labelKey: 'commandes.groupes.demain',    items: tomorrow           },
    week.length     && { labelKey: 'commandes.groupes.semaine',   items: week               },
    later.length    && { labelKey: 'commandes.groupes.plus_tard', items: later              },
    noDate.length   && { labelKey: 'commandes.groupes.sans_date', items: noDate             },
  ].filter(Boolean)
}

function ListView({ commandes, navigate }) {
  const { t } = useTranslation()
  const groups = useMemo(() => groupByDate(commandes), [commandes])

  return (
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group.labelKey}>
          <p className={cn('text-xs font-semibold uppercase tracking-widest mb-2 px-1',
            group.danger ? 'text-danger' : 'text-ghost'
          )}>
            {t(group.labelKey)}
          </p>
          <div className="space-y-2">
            {group.items.map(cmd => (
              <CommandeCard
                key={cmd.id}
                commande={cmd}
                onClick={() => navigate(`/commandes/${cmd.id}`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Chips de filtre ───────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'urgentes',      tKey: 'commandes.filtres.urgentes',      icon: Zap      },
  { key: 'impayees',      tKey: 'commandes.filtres.impayees',       icon: Banknote },
  { key: 'cette_semaine', tKey: 'commandes.filtres.cette_semaine',  icon: Calendar },
]

function FilterChips({ active, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
      {FILTERS.map(({ key, tKey, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(active === key ? null : key)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            active === key
              ? 'bg-primary text-inverse'
              : 'bg-subtle text-ghost hover:text-ink',
          )}
        >
          <Icon size={11} />
          {t(tKey)}
        </button>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CommandesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [view,   setView]   = useState('pipeline')   // 'pipeline' | 'liste'
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [statut, setStatut] = useState('tous')       // #26 — tabs statut

  const alerte = searchParams.get('alerte')

  const { data: commandes = [], isLoading } = useCommandes()

  const filtered = useMemo(() => {
    // #26 — filtre par tab statut
    let list = statut === 'tous'
      ? commandes.filter(c => c.statut !== 'annule')
      : commandes.filter(c => c.statut === statut)

    // Filtre alerte URL (rétrocompatibilité)
    if (alerte === 'retard') {
      return commandes.filter(c =>
        c.statut === 'en_cours' && c.date_livraison_prevue &&
        isPast(parseISO(c.date_livraison_prevue)) && !isToday(parseISO(c.date_livraison_prevue))
      )
    }

    // Filtre chip actif
    if (filter === 'urgentes')      list = list.filter(c => c.urgence)
    if (filter === 'impayees')      list = list.filter(c => (c.prix ?? 0) - (c.acompte ?? 0) > 0)
    if (filter === 'cette_semaine') list = list.filter(c =>
      c.date_livraison_prevue && isThisWeek(parseISO(c.date_livraison_prevue), { weekStartsOn: 1 })
    )

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.client_nom?.toLowerCase().includes(q) ||
        c.vetement_nom?.toLowerCase().includes(q)
      )
    }

    return list
  }, [commandes, alerte, filter, search, statut])

  const byStatut = useMemo(() => {
    const map = {}
    PIPELINE_COLS.forEach(col => { map[col.key] = [] })
    filtered.forEach(c => {
      if (map[c.statut]) map[c.statut].push(c)
    })
    return map
  }, [filtered])

  const isSearching = !!search.trim() || !!filter || !!alerte

  return (
    <AppLayout
      title={t('commandes.titre')}
      onRefresh={() => queryClient.invalidateQueries()}
    >
      <div className="flex flex-col h-full">
        {/* Barre de recherche + filtres */}
        <div className="px-4 pt-3 pb-2 space-y-2 border-b border-edge">
          {/* Recherche + bouton de vue (kanban/liste), hors du header rouge */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={t('commandes.recherche_placeholder')}
              />
            </div>
            <button
              type="button"
              onClick={() => setView(v => v === 'pipeline' ? 'liste' : 'pipeline')}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-edge bg-subtle text-ghost hover:text-ink transition-colors"
              aria-label={t('commun.changer_vue') || 'Changer la vue'}
            >
              {view === 'pipeline' ? <LayoutList size={18} /> : <Columns2 size={18} />}
            </button>
          </div>
          {/* #26 — Tabs statut scrollables horizontalement */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
            {[
              { key: 'tous',     label: t('commandes.onglets.toutes') },
              { key: 'en_cours', label: t('commandes.statut.en_cours') },
              { key: 'livre',    label: t('commandes.onglets.livrees') },
              { key: 'annule',   label: t('commandes.onglets.annulees') },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatut(key)}
                className={cn(
                  'shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  statut === key
                    ? 'bg-primary text-inverse border-primary'
                    : 'bg-subtle text-ghost border-transparent hover:text-ink',
                )}
              >
                {label}
                {key !== 'tous' && (
                  <span className="ml-1.5 opacity-60">
                    {commandes.filter(c => c.statut === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <FilterChips active={filter} onChange={setFilter} />

          {/* Bannière alerte URL */}
          {alerte && (
            <div className={cn(
              'flex items-center gap-2 text-xs font-medium rounded-xl px-3 py-2',
              alerte === 'retard' ? 'bg-danger/8 text-danger' : 'bg-warning/8 text-warning'
            )}>
              {alerte === 'retard' ? <AlertTriangle size={13} /> : <Timer size={13} />}
              <span className="flex-1">
                {alerte === 'retard' ? t('commandes.alertes.retard') : t('commandes.alertes.bientot')}
              </span>
              <button type="button" onClick={() => navigate('/commandes')} className="opacity-60 hover:opacity-100">
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={ClipboardList}
              title={isSearching ? t('commun.aucun_resultat') : t('commandes.vide.calme')}
              description={
                isSearching
                  ? t('commandes.vide.filtre_desc')
                  : t('commandes.vide.calme_desc')
              }
              primaryAction={
                !isSearching ? (
                  <Button onClick={() => navigate('/commandes/new')}>
                    {t('commandes.vide.action')}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : view === 'pipeline' ? (
          /* Vue pipeline */
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 h-full overflow-x-auto px-4 pt-4 pb-2 scrollbar-none">
              {PIPELINE_COLS.map(col => (
                <PipelineColumn
                  key={col.key}
                  col={col}
                  commandes={byStatut[col.key] ?? []}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Vue liste */
          <div className="flex-1 overflow-y-auto p-4">
            <ListView commandes={filtered} navigate={navigate} />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
