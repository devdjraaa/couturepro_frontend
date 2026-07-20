import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCompteRebours, remplir } from './compteRebours'

/**
 * CLI-3 — Les deux visages du compte à rebours de lancement.
 *
 * BANDE : discrète, en haut de page, à partir du seuil configuré (J-30 par
 * défaut). Refermable, et le refus est mémorisé POUR LA JOURNÉE seulement : une
 * bande qu'on ne peut plus jamais faire revenir raterait le jour J, une bande
 * qui réapparaît à chaque navigation serait insupportable pendant un mois.
 *
 * CHRONO : plein écran le jour J. Il ne s'impose qu'une fois par appareil et
 * par jour, et reste refermable — un écran bloquant sur une vitrine publique
 * ferait fuir exactement les visiteurs qu'on cherche à retenir.
 *
 * Les deux se masquent d'eux-mêmes une fois l'échéance passée : la direction
 * n'a pas à repasser en admin le lendemain pour éteindre l'annonce.
 */

// Un rejet vaut pour la journée en cours, pas au-delà.
const cleJour = (suffixe) => `gx_rebours_${suffixe}_${new Date().toISOString().slice(0, 10)}`

function dejaVu(suffixe) {
  try {
    return localStorage.getItem(cleJour(suffixe)) === '1'
  } catch {
    // Navigation privée ou stockage refusé : on affiche. Mieux vaut une bande
    // de trop qu'une annonce de lancement jamais vue.
    return false
  }
}

function marquerVu(suffixe) {
  try {
    localStorage.setItem(cleJour(suffixe), '1')
  } catch {
    // Sans mémoire, la bande réapparaîtra : dégradation acceptable.
  }
}

/** Un bloc du chrono : valeur + unité. */
function Case({ valeur, libelle }) {
  return (
    <div className="flex flex-col items-center min-w-[62px]">
      <span className="text-4xl sm:text-5xl font-bold tabular-nums leading-none">
        {String(valeur).padStart(2, '0')}
      </span>
      <span className="text-[11px] uppercase tracking-wide opacity-70 mt-1.5">{libelle}</span>
    </div>
  )
}

export default function CompteReboursLancement() {
  const { t } = useTranslation()
  const { phase, cfg, reste } = useCompteRebours()
  const [ferme, setFerme] = useState(false)

  // Le rejet mémorisé n'est lu qu'une fois la phase connue : avant, on ne sait
  // pas quelle clé interroger.
  useEffect(() => {
    if (phase === 'bande' || phase === 'jour_j') setFerme(dejaVu(phase))
  }, [phase])

  if (!phase || phase === 'passe' || ferme) return null

  const couleur = cfg.couleur || 'var(--color-primary)'

  const fermer = () => {
    marquerVu(phase)
    setFerme(true)
  }

  // ── Jour J : chrono plein écran ────────────────────────────────────────
  if (phase === 'jour_j' && cfg.chrono_jour_j) {
    return (
      <div role="dialog" aria-modal="true" aria-label={cfg.titre}
           className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-white"
           style={{ backgroundColor: couleur }}>
        <button type="button" onClick={fermer} aria-label={t('commun.fermer')}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/15">
          <X size={20} aria-hidden="true" />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold text-center">{cfg.titre}</h2>
        <p className="mt-2 text-sm sm:text-base opacity-90 text-center max-w-md">
          {remplir(cfg.texte_jour_j, reste)}
        </p>

        <div className="flex items-start gap-5 sm:gap-8 mt-10">
          <Case valeur={reste.heures}   libelle={t('compte_rebours.heures')} />
          <Case valeur={reste.minutes}  libelle={t('compte_rebours.minutes')} />
          <Case valeur={reste.secondes} libelle={t('compte_rebours.secondes')} />
        </div>

        {cfg.lien && (
          <a href={cfg.lien} onClick={fermer}
             className="mt-10 rounded-xl bg-white/95 text-ink text-sm font-semibold px-6 py-2.5 hover:bg-white">
            {t('compte_rebours.en_savoir_plus')}
          </a>
        )}
      </div>
    )
  }

  // ── Approche : bande discrète ──────────────────────────────────────────
  return (
    <div className="w-full text-white text-sm" style={{ backgroundColor: couleur }}>
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2">
        <span className="font-semibold shrink-0">{cfg.titre}</span>
        <span className="opacity-90 truncate">{remplir(cfg.texte_bande, reste)}</span>

        {cfg.lien && (
          <a href={cfg.lien} className="ml-auto underline underline-offset-2 shrink-0 hidden sm:inline">
            {t('compte_rebours.en_savoir_plus')}
          </a>
        )}

        <button type="button" onClick={fermer} aria-label={t('commun.fermer')}
                className={`p-1 rounded-full hover:bg-white/20 shrink-0 ${cfg.lien ? '' : 'ml-auto'}`}>
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
