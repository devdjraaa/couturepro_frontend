import { useState } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@/components/ui'
import { cn } from '@/utils/cn'

/**
 * Un « i » qui explique, à poser à côté de ce qui n'est pas évident.
 *
 * Plusieurs écrans demandent une décision sans dire ce qu'elle engage : on
 * choisit « assistant » ou « membre » dans une liste, sans savoir ce que
 * chacun pourra faire. Le patron tranche à l'aveugle, puis découvre les
 * conséquences à l'usage — ou ne les découvre jamais.
 *
 * L'explication est PLIÉE par défaut, et non affichée en permanence : un écran
 * couvert de paragraphes d'aide finit par ne plus être lu du tout. Elle
 * s'ouvre en panneau bas, comme le reste de l'application sur mobile.
 *
 * Ce composant ne porte aucun texte : il reçoit ce qu'il doit montrer. Une
 * aide écrite ici se retrouverait à mentir dès que la règle change — c'est
 * exactement ce qui est arrivé à la mention « Création & archivage » de
 * l'assistant, restée en place après l'élargissement de ses droits.
 */
export default function AideContextuelle({ titre, children, className, taille = 15 }) {
  const { t } = useTranslation()
  const [ouvert, setOuvert] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={titre || t('aide.titre')}
        className={cn(
          'inline-flex items-center justify-center shrink-0 rounded-full',
          'text-ghost hover:text-primary active:text-primary transition',
          // Cible tactile confortable sans grossir la mise en page : le bouton
          // déborde visuellement sans occuper plus de place dans le flux.
          'w-6 h-6 -m-0.5',
          className,
        )}
      >
        <Info size={taille} aria-hidden="true" />
      </button>

      <BottomSheet isOpen={ouvert} onClose={() => setOuvert(false)} title={titre || t('aide.titre')}>
        <div className="px-4 pb-5 text-[13.5px] text-dim leading-relaxed">
          {children}
        </div>
      </BottomSheet>
    </>
  )
}
