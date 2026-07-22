import { useEffect } from 'react'
import { signalerAppMontee, surveillerMisesAJourOta } from '@/utils/appUpdate'

/**
 * Confirme le bundle OTA auprès de Capgo — mais seulement une fois l'arbre React
 * réellement monté, et après quelques secondes sans plantage.
 *
 * Ce composant n'affiche rien : il n'existe que pour que la confirmation dépende
 * d'un rendu abouti. Placé dans `App`, il est monté sous le garde-fou global,
 * donc un écran qui tombe au démarrage annule la confirmation avant qu'elle ne
 * parte (voir `signalerDemarrageRate` dans `utils/appUpdate`).
 *
 * Pose aussi les écouteurs qui rapportent l'échec d'une mise à jour au serveur
 * (voir `surveillerMisesAJourOta`) : c'est le bundle EN COURS D'EXÉCUTION qui
 * doit les porter, puisqu'un bundle qui échoue à s'appliquer ne démarre jamais
 * assez pour prévenir de quoi que ce soit lui-même.
 */
export default function ConfirmationBundle() {
  useEffect(() => {
    signalerAppMontee()
    surveillerMisesAJourOta()
  }, [])
  return null
}
