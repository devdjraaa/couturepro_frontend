import { SearchX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

/**
 * Écran affiché quand la ressource demandée n'existe pas.
 *
 * Les pages de détail faisaient `if (!commande) return null` : sur un
 * identifiant inconnu — lien périmé, élément supprimé entre-temps, adresse
 * tapée à la main — l'utilisateur se retrouvait devant un écran BLANC, sans
 * titre, sans retour, sans rien lui dire. Le seul geste possible était de
 * fermer l'application.
 *
 * Le message ne prétend pas savoir pourquoi : supprimé, jamais existé ou hors
 * de portée, on ne peut pas le distinguer côté écran, et inventer une raison
 * serait pire que de n'en donner aucune.
 */
export default function RessourceIntrouvable({ onRetour }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 gap-3">
      <SearchX size={38} strokeWidth={1.5} className="text-ghost" aria-hidden="true" />
      <h2 className="text-base font-semibold text-ink">{t('erreurs.introuvable_titre')}</h2>
      <p className="text-sm text-dim max-w-[320px]">{t('erreurs.introuvable_description')}</p>
      <button
        type="button"
        onClick={() => (onRetour ? onRetour() : navigate(-1))}
        className="mt-2 rounded-xl bg-primary text-inverse text-sm font-semibold px-5 py-2.5"
      >
        {t('commun.retour')}
      </button>
    </div>
  )
}
