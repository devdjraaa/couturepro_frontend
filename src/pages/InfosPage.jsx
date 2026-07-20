import { useMemo, useState } from 'react'
import {
  Megaphone, Sparkles, Lightbulb, Percent, AlertTriangle,
  Calendar, GraduationCap, ShieldAlert, Info as InfoIcon, Pin, ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInfos, useMarquerInfoLue, useMarquerToutesInfosLues } from '@/hooks/useInfos'
import { AppLayout } from '@/components/layout'
import { Skeleton, EmptyState } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

/**
 * CLI-2 — « Gextimo Infos ».
 *
 * Écran distinct des notifications, et c'est le fond du sujet : une
 * notification dit ce qui est arrivé à VOTRE atelier et appelle une action ;
 * une info est un message éditorial de Gextimo vers la communauté. Les
 * mélanger, c'est noyer les alertes qui comptent sous des annonces — ou faire
 * disparaître une annonce sous vingt notifications de commandes.
 *
 * Catégories, libellés et couleurs viennent du SERVEUR : la direction en
 * ajoutera au fil des campagnes sans attendre un déploiement. Rien n'est figé
 * ici, sauf la correspondance nom d'icône → composant, que seul le code peut
 * fournir.
 */

// Le serveur envoie un NOM d'icône ; seul le code peut le relier à un
// composant. Une icône inconnue retombe sur un pictogramme neutre plutôt que
// de casser la liste.
const ICONES = {
  megaphone: Megaphone,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  percent: Percent,
  'alert-triangle': AlertTriangle,
  calendar: Calendar,
  'graduation-cap': GraduationCap,
  'shield-alert': ShieldAlert,
}

function CarteInfo({ info, categorie, onOuvrir }) {
  const { t } = useTranslation()
  const Icone = ICONES[categorie?.icone] ?? InfoIcon
  const couleur = categorie?.couleur || 'var(--color-primary)'

  return (
    <article
      onClick={() => onOuvrir(info)}
      className={cn(
        'px-4 py-3.5 cursor-pointer transition-colors hover:bg-subtle/60',
        !info.lu && 'bg-primary/[0.04]',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${couleur}1a`, color: couleur }}>
          <Icone size={16} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${couleur}1a`, color: couleur }}>
              {categorie?.label || info.categorie}
            </span>

            {info.epingle && (
              <span className="text-ghost" title={t('infos.epinglee')}>
                <Pin size={11} aria-hidden="true" />
              </span>
            )}

            {/* Une pastille plutôt qu'un gras : le titre doit rester lisible. */}
            {!info.lu && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-label={t('infos.non_lue')} />}

            <span className="text-[11px] text-ghost ml-auto shrink-0">
              {formatDate(info.publie_at || info.created_at)}
            </span>
          </div>

          <h3 className={cn('text-sm mt-1 text-ink', info.lu ? 'font-medium' : 'font-semibold')}>
            {info.titre}
          </h3>

          <p className="text-sm text-dim leading-relaxed mt-0.5 whitespace-pre-line">
            {info.contenu}
          </p>

          {info.lien && (
            <a href={info.lien} target="_blank" rel="noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
              {t('infos.en_savoir_plus')}
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function InfosPage() {
  const { t } = useTranslation()
  const [filtre, setFiltre] = useState('toutes')

  const { data, isLoading } = useInfos()
  const marquerLue = useMarquerInfoLue()
  const marquerToutes = useMarquerToutesInfosLues()

  const infos = data?.infos ?? []
  const categories = data?.categories ?? []

  const parCle = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.cle, c])),
    [categories],
  )

  // Seules les catégories PRÉSENTES sont proposées en filtre : offrir huit
  // onglets dont sept sont vides donne l'impression d'un écran cassé.
  const categoriesUtilisees = useMemo(() => {
    const cles = new Set(infos.map((i) => i.categorie))

    return categories.filter((c) => cles.has(c.cle))
  }, [infos, categories])

  const affichees = useMemo(
    () => (filtre === 'toutes' ? infos : infos.filter((i) => i.categorie === filtre)),
    [infos, filtre],
  )

  const nonLues = infos.filter((i) => !i.lu).length

  const ouvrir = (info) => {
    if (!info.lu) marquerLue.mutate(info.id)
  }

  return (
    <AppLayout
      title={t('infos.titre')}
      showBack
      rightAction={nonLues > 0 ? (
        <button type="button" onClick={() => marquerToutes.mutate()}
                className="text-xs font-medium text-inverse/80 hover:text-inverse px-2 py-1">
          {t('infos.tout_lire')}
        </button>
      ) : null}
    >
      {categoriesUtilisees.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 py-2.5 border-b border-edge">
          {[{ cle: 'toutes', label: t('infos.cat_toutes') }, ...categoriesUtilisees].map((c) => (
            <button key={c.cle} type="button" onClick={() => setFiltre(c.cle)}
                    className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      filtre === c.cle ? 'bg-primary text-inverse' : 'bg-subtle text-ghost hover:text-ink')}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : affichees.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t('infos.vide_titre')}
          description={filtre === 'toutes' ? t('infos.vide_desc') : t('infos.vide_categorie')}
          className="py-16"
        />
      ) : (
        <div className="divide-y divide-edge pb-safe">
          {affichees.map((info) => (
            <CarteInfo key={info.id} info={info} categorie={parCle[info.categorie]} onOuvrir={ouvrir} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
