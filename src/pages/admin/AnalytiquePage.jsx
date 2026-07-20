import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Users, Store, TrendingUp } from 'lucide-react'
import { AdminLayout } from '@/components/admin'
import EmptyState from '@/components/ui/EmptyState'
import { useAnalytique } from '@/hooks/admin/useAnalytique'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

/**
 * Tableau de bord analytique interne (P202 phase 5).
 *
 * Le calcul vivait côté serveur depuis le 16/07 et la collecte tournait — mais
 * AUCUN écran ne l'affichait : quatre jours de données s'étaient accumulés sans
 * que personne puisse les lire.
 *
 * Ces chiffres viennent de NOS tables, pas de Google ni de Meta : ils sont
 * disponibles sans clé tierce et sans envoyer quoi que ce soit à l'extérieur.
 *
 * Tout est défensif à la lecture : la collecte est jeune, la plupart des
 * sections seront vides au début. Une section vide se tait au lieu d'afficher
 * un zéro trompeur ou de casser.
 */

const CARTE = 'bg-card border border-edge rounded-2xl p-4'

/* Le serveur renvoie tantôt un objet clé→valeur, tantôt un tableau : on
   normalise plutôt que de supposer une forme qui changerait au prochain calcul. */
const enPaires = (v) => {
  if (!v) return []
  if (Array.isArray(v)) return v.map((x, i) => [String(i), x])

  return Object.entries(v)
}

function Chiffre({ libelle, valeur, accent = false }) {
  return (
    <div className={CARTE}>
      <p className="text-[11px] uppercase tracking-wider text-ghost">{libelle}</p>
      <p className={cn('mt-1 font-bold font-mono', accent ? 'text-2xl text-primary' : 'text-2xl text-ink')}>
        {valeur}
      </p>
    </div>
  )
}

/** Barres proportionnelles — lisibles sans dépendance graphique. */
function Barres({ titre, donnees, aide, format = (v) => v }) {
  const paires = enPaires(donnees)
  if (paires.length === 0) return null

  const max = Math.max(...paires.map(([, v]) => Number(v) || 0), 1)

  return (
    <div className={CARTE}>
      <p className="text-sm font-semibold text-ink mb-1">{titre}</p>
      {aide && <p className="text-[11px] text-ghost leading-relaxed mb-3">{aide}</p>}
      <div className="space-y-2">
        {paires.map(([cle, val]) => (
          <div key={cle}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-dim truncate">{cle}</span>
              <span className="text-ink font-mono font-medium shrink-0">{format(val)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-subtle overflow-hidden mt-1">
              <div className="h-full rounded-full bg-primary"
                   style={{ width: `${Math.round(((Number(val) || 0) / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Liste({ titre, lignes, aide, rendu }) {
  if (!Array.isArray(lignes) || lignes.length === 0) return null

  return (
    <div className={CARTE}>
      <p className="text-sm font-semibold text-ink mb-1">{titre}</p>
      {aide && <p className="text-[11px] text-ghost leading-relaxed mb-3">{aide}</p>}
      <ul className="divide-y divide-edge">
        {lignes.map((l, i) => <li key={i} className="py-2 text-[13px]">{rendu(l)}</li>)}
      </ul>
    </div>
  )
}

export default function AnalytiquePage() {
  const { t } = useTranslation()
  const T = (c, o) => t(`admin.analytique.${c}`, o)
  const { data, isLoading } = useAnalytique()
  const [vue, setVue] = useState('globale')

  const onglets = [
    ['globale', BarChart3], ['clients', Users],
    ['designers', Store], ['tendances', TrendingUp],
  ]

  const g = data?.globale
  const c = data?.clients
  const d = data?.designers
  const tr = data?.tendances

  // La collecte est jeune : si RIEN n'est encore remonté, on le dit clairement
  // plutôt que d'afficher une page de zéros qu'on croirait cassée.
  const aucuneDonnee = !isLoading && data
    && !g?.visiteurs?.mois && !g?.clients_total && !g?.commandes?.total

  return (
    <AdminLayout title={T('titre')}>
      <div className="max-w-4xl space-y-4">
        <p className="text-[13px] text-dim">{T('sous_titre')}</p>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {onglets.map(([cle, Icone]) => (
            <button key={cle} type="button" onClick={() => setVue(cle)}
              className={cn(
                'shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition',
                vue === cle ? 'bg-primary text-inverse' : 'bg-subtle text-dim hover:text-ink',
              )}>
              <Icone size={14} aria-hidden="true" />{T(`onglet_${cle}`)}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-subtle animate-pulse" />)}
          </div>
        )}

        {aucuneDonnee && (
          <EmptyState icon={BarChart3} title={T('vide')} description={T('vide_aide')} />
        )}

        {!isLoading && !aucuneDonnee && vue === 'globale' && g && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <Chiffre libelle={T('aujourdhui')} valeur={g.visiteurs?.aujourdhui ?? 0} />
              <Chiffre libelle={T('semaine')} valeur={g.visiteurs?.semaine ?? 0} />
              <Chiffre libelle={T('mois')} valeur={g.visiteurs?.mois ?? 0} accent />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Chiffre libelle={T('clients_total')} valeur={g.clients_total ?? 0} />
              <Chiffre libelle={T('inscriptions_mois')} valeur={g.inscriptions_mois ?? 0} />
              <Chiffre libelle={T('commandes_mois')} valeur={g.commandes?.mois ?? 0} />
              <Chiffre libelle={T('valeur_mois')} valeur={formatCurrency(g.commandes?.valeur_mois ?? 0)} accent />
              <Chiffre libelle={T('commandes_total')} valeur={g.commandes?.total ?? 0} />
              <Chiffre libelle={T('conversion')}
                       valeur={g.taux_conversion_mois == null ? '—' : `${g.taux_conversion_mois} %`} />
            </div>
          </div>
        )}

        {!isLoading && !aucuneDonnee && vue === 'clients' && c && (
          <div className="space-y-3">
            <Chiffre libelle={T('paniers')} valeur={c.paniers_abandonnes_7j ?? 0} />
            <Barres titre={T('segments')} donnees={c.segments} />
            <Liste titre={T('recherches_vides')} aide={T('recherches_vides_aide')}
                   lignes={c.recherches_sans_resultat}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{l.terme}</span>
                       <span className="text-ghost font-mono shrink-0">{T('fois', { count: l.nombre_fois })}</span>
                     </div>
                   )} />
            <Liste titre={T('vip')} lignes={c.vip}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{[l.prenom, l.nom].filter(Boolean).join(' ') || l.email}</span>
                       <span className="text-ghost font-mono shrink-0">{formatCurrency(l.clv ?? 0)}</span>
                     </div>
                   )} />
            <Liste titre={T('churn')} lignes={c.churn_eleve}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{[l.prenom, l.nom].filter(Boolean).join(' ') || l.email}</span>
                       <span className="text-warning text-[11px] uppercase tracking-wide shrink-0">{l.segment}</span>
                     </div>
                   )} />
          </div>
        )}

        {!isLoading && !aucuneDonnee && vue === 'designers' && d && (
          <div className="space-y-3">
            <Liste titre={T('classement_revenus')} lignes={d.classement_revenus}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{l.nom}</span>
                       <span className="text-ghost font-mono shrink-0">
                         {formatCurrency(l.revenus?.mois_en_cours ?? 0)}
                       </span>
                     </div>
                   )} />
            <Liste titre={T('scores')} lignes={d.scores_confiance}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{l.nom}</span>
                       <span className="text-ghost font-mono shrink-0">{l.score_confiance}</span>
                     </div>
                   )} />
            <Liste titre={T('alertes')} lignes={d.alertes_score_bas}
                   rendu={(l) => (
                     <div className="flex items-baseline justify-between gap-3">
                       <span className="text-ink truncate">{l.nom}</span>
                       <span className="text-danger font-mono shrink-0">{l.score_confiance}</span>
                     </div>
                   )} />
            {Array.isArray(d.sans_commande_15j) && d.sans_commande_15j.length > 0 && (
              <div className={CARTE}>
                <p className="text-sm font-semibold text-ink mb-2">{T('sans_commande')}</p>
                <p className="text-[13px] text-dim leading-relaxed">{d.sans_commande_15j.join(' · ')}</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !aucuneDonnee && vue === 'tendances' && tr && (
          <div className="space-y-3">
            <Barres titre={T('categories_top')} donnees={tr.categories_top} />
            <Barres titre={T('heures_pointe')} donnees={tr.heures_pointe} />
            <Barres titre={T('canaux')} donnees={tr.canaux_acquisition} />
            <Barres titre={T('revenus_6_mois')} donnees={tr.revenus_6_mois}
                    format={(v) => formatCurrency(v)} />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
