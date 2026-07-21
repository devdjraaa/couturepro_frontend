import { useEffect, useState } from 'react'
import { Sparkles, Wrench, Bug, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@/components/layout'
import { Skeleton, EmptyState } from '@/components/ui'
import { journalMajService } from '@/services/journalMajService'
import { formatDate } from '@/utils/formatDate'

/**
 * CLI-1 — « Quoi de neuf ».
 *
 * Les publications sont automatiques au push : sans cet écran, les
 * professionnels voyaient l'application changer sous leurs yeux sans jamais
 * savoir ce qui avait bougé. La seule information disponible était une ligne de
 * texte dans la fenêtre de mise à jour, perdue dès qu'on la fermait.
 *
 * La consultation est marquée à l'OUVERTURE, pas au défilement : venir voir la
 * page suffit à considérer qu'on est au courant.
 */

const TYPES = {
  nouveaute:    { icone: Sparkles, couleur: 'text-primary',  fond: 'bg-primary/10' },
  amelioration: { icone: Wrench,   couleur: 'text-info',     fond: 'bg-info/10' },
  correction:   { icone: Bug,      couleur: 'text-success',  fond: 'bg-success/10' },
}

export default function QuoiDeNeufPage() {
  const { t } = useTranslation()
  const [entrees, setEntrees] = useState(null)

  useEffect(() => {
    journalMajService.getAll().then((liste) => {
      setEntrees(liste)
      // Marquée vue dès l'affichage : la pastille ne doit pas survivre à la
      // visite. Sur la version la plus récente uniquement — c'est elle qui
      // décide de la pastille.
      journalMajService.marquerVue(liste?.[0]?.version)
    })
  }, [])

  return (
    <AppLayout title={t('quoi_de_neuf.titre')} showBack>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {entrees === null ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : entrees.length === 0 ? (
          <EmptyState
            icon={Rocket}
            title={t('quoi_de_neuf.vide_titre')}
            description={t('quoi_de_neuf.vide_desc')}
            className="py-16"
          />
        ) : (
          entrees.map((e) => {
            const type = TYPES[e.type] ?? TYPES.amelioration
            const Icone = type.icone

            return (
              <article key={`${e.version}-${e.date}`} className="rounded-2xl border border-edge bg-card p-4">
                <div className="flex items-center gap-2.5">
                  <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${type.fond} ${type.couleur}`}>
                    <Icone size={16} aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    {/* Pas de `truncate` : sur mobile, un titre coupé à mi-mot
                        perd son sens (« Vos réalisations consultables sans ré… »).
                        Deux lignes suffisent, et la carte s'ajuste. */}
                    <p className="font-semibold text-ink leading-snug">{e.titre}</p>
                    <p className="text-[11px] text-ghost">
                      {t('quoi_de_neuf.version', { v: e.version })} · {formatDate(e.date)}
                    </p>
                  </div>
                </div>

                {e.lignes?.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {e.lignes.map((ligne, i) => (
                      <li key={i} className="flex gap-2 text-sm text-dim leading-relaxed">
                        <span className="text-ghost shrink-0">·</span>
                        <span>{ligne}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            )
          })
        )}
      </div>
    </AppLayout>
  )
}
