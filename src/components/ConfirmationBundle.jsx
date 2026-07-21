import { useEffect } from 'react'
import { signalerAppMontee } from '@/utils/appUpdate'

/**
 * Confirme le bundle OTA auprès de Capgo — mais seulement une fois l'arbre React
 * réellement monté, et après quelques secondes sans plantage.
 *
 * Ce composant n'affiche rien : il n'existe que pour que la confirmation dépende
 * d'un rendu abouti. Placé dans `App`, il est monté sous le garde-fou global,
 * donc un écran qui tombe au démarrage annule la confirmation avant qu'elle ne
 * parte (voir `signalerDemarrageRate` dans `utils/appUpdate`).
 */
export default function ConfirmationBundle() {
  useEffect(() => { signalerAppMontee() }, [])
  return null
}
