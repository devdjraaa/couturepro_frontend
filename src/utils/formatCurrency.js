import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts'
import { API_BASE_URL } from '@/constants/config'

/**
 * Formatage des montants — CLI-1, détection pays/devise.
 *
 * TROIS défauts corrigés ici, tous invisibles tant qu'on ne testait qu'au Bénin :
 *
 * 1. Le hook lisait `atelier.devise`, qui n'existe pas : le serveur range la
 *    devise sous `atelier.parametres.devise`. Il retombait donc TOUJOURS sur la
 *    valeur par défaut, et le réglage n'atteignait jamais l'écran.
 *
 * 2. Le nombre de décimales était figé à zéro. Le franc CFA ne se divise pas,
 *    mais le cedi, le naira ou l'euro si : un montant ghanéen s'affichait
 *    arrondi à l'unité, ce qui fausse une facture.
 *
 * 3. Le code de la devise servait d'étiquette (« 125 000 XOF ») alors que
 *    dix-neuf autres écrans écrivaient « FCFA » en clair. Deux habillages
 *    différents pour la même monnaie, selon l'écran.
 *
 * Symbole et décimales viennent du SERVEUR (`GET /vitrine/devises`), éditables
 * en admin : aucune correspondance devise → symbole n'est écrite ici.
 */

// Repli utilisé avant la réponse du serveur, et s'il est injoignable. Il
// correspond au cas très majoritaire ; on ne bloque jamais l'affichage d'un
// montant en attendant le réseau.
const REPLI = { devise: 'XOF', symbole: 'FCFA', decimales: 0 }

let referentiel = null
let chargement = null

/** Charge le référentiel une seule fois pour toute la session. */
export function chargerDevises() {
  if (referentiel) return Promise.resolve(referentiel)
  if (chargement) return chargement

  chargement = fetch(`${API_BASE_URL}/vitrine/devises`, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      referentiel = d?.formats ? d : { defaut: REPLI, formats: {} }
      return referentiel
    })
    .catch(() => {
      referentiel = { defaut: REPLI, formats: {} }
      return referentiel
    })

  return chargement
}

/** Symbole et décimales d'une devise. */
function formatDe(devise) {
  const f = referentiel?.formats?.[devise]
  if (f) return f

  if (devise === REPLI.devise) return REPLI

  // Devise inconnue du référentiel : on affiche son code plutôt que d'échouer.
  // Un montant doit rester lisible, même mal habillé.
  return { symbole: devise, decimales: 0 }
}

function nombre(amount, decimales) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(amount)
}

/**
 * Formate un montant : « 125 000 FCFA », « 1 250,50 GH₵ ».
 * Le composant doit appliquer `font-mono` à l'affichage.
 */
export function formatCurrency(amount, devise = REPLI.devise) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'

  const { symbole, decimales } = formatDe(devise)

  return `${nombre(amount, decimales)} ${symbole}`
}

/** Formate sans l'unité : « 125 000 ». */
export function formatAmount(amount, devise = REPLI.devise) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'

  return nombre(amount, formatDe(devise).decimales)
}

/** Symbole seul, pour les libellés du type « Montant (FCFA) ». */
export function symboleDevise(devise = REPLI.devise) {
  return formatDe(devise).symbole
}

/** Calcule le reste à payer. */
export function calculerReste(montant, avance = 0) {
  return Math.max(0, (montant || 0) - (avance || 0))
}

/** Pourcentage d'avance payée. */
export function pourcentageAvance(montant, avance) {
  if (!montant || montant === 0) return 0

  return Math.min(100, Math.round(((avance || 0) / montant) * 100))
}

/** Devise d'un atelier, là où le serveur la range réellement. */
export function deviseDe(atelier) {
  return atelier?.parametres?.devise || atelier?.devise || REPLI.devise
}

/**
 * Hook de formatage lié à l'atelier connecté.
 *
 * L'état force un nouveau rendu quand le référentiel arrive : sans lui, les
 * montants affichés avant la réponse resteraient figés sur le repli, et un
 * atelier ghanéen verrait « FCFA » jusqu'au prochain changement de page.
 */
export function useFormatCurrency() {
  const { atelier } = useAuth()
  const [, setPret] = useState(Boolean(referentiel))

  useEffect(() => {
    let vivant = true
    chargerDevises().then(() => { if (vivant) setPret(true) })

    return () => { vivant = false }
  }, [])

  const devise = deviseDe(atelier)

  return (amount) => formatCurrency(amount, devise)
}

/**
 * Variante rendant aussi le symbole, pour les écrans qui l'affichent seul.
 *
 * ⚠️ À ne pas confondre avec le `useDevise` de `pages/vitrine/vitrineCurrency`,
 * qui gère la devise d'AFFICHAGE choisie par un visiteur de la vitrine, avec
 * conversion selon les taux du jour. Ici il s'agit de la devise de
 * COMPTABILITÉ de l'atelier : une facture ne se convertit pas.
 */
export function useDeviseAtelier() {
  const { atelier } = useAuth()
  const [, setPret] = useState(Boolean(referentiel))

  useEffect(() => {
    let vivant = true
    chargerDevises().then(() => { if (vivant) setPret(true) })

    return () => { vivant = false }
  }, [])

  const devise = deviseDe(atelier)

  return { devise, symbole: symboleDevise(devise), format: (m) => formatCurrency(m, devise) }
}
