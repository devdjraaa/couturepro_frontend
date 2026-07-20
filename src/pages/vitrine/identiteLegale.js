/**
 * Identité légale de la société, injectée dans les 11 pages juridiques.
 *
 * Ces valeurs (RCCM, IFU, numéro de délibération APDP, dates d'entrée en
 * vigueur) étaient écrites en clair dans les fichiers de traduction sous forme
 * de gabarits — « [NUMÉRO RCCM : à compléter après immatriculation] » — et donc
 * PUBLIÉES telles quelles. Un crochet « à compléter » sur des mentions légales
 * est pire qu'une absence : il donne à lire que la société n'est pas
 * immatriculée.
 *
 * Elles viennent désormais du serveur (`GET /vitrine/identite-legale`, éditable
 * en admin). Règle de dégradation : tant qu'une valeur est vide, TOUTE phrase
 * qui la mentionne disparaît. On ne peut pas écrire « déclaré sous la
 * délibération n°  » avec un blanc — la phrase entière n'a plus de sens.
 */
import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/constants/config'

const VIDE = {
  rccm: '', ifu: '', apdp_deliberation: '',
  date_entree_vigueur: '', date_maj: '',
}

// Mémorisé pour la durée de la session : ces valeurs changent une fois par an
// au plus, et les 11 pages légales sont souvent parcourues à la suite.
let cache = null

export async function chargerIdentiteLegale() {
  if (cache) return cache
  try {
    const r = await fetch(`${API_BASE_URL}/vitrine/identite-legale`, { headers: { Accept: 'application/json' } })
    cache = r.ok ? { ...VIDE, ...(await r.json()) } : VIDE
  } catch {
    // Serveur injoignable : on retombe sur des valeurs vides, donc sur des
    // pages amputées de ces lignes — jamais sur un gabarit affiché.
    cache = VIDE
  }

  return cache
}

export function useIdentiteLegale() {
  const [identite, setIdentite] = useState(cache ?? VIDE)

  useEffect(() => {
    let vivant = true
    chargerIdentiteLegale().then((v) => { if (vivant) setIdentite(v) })

    return () => { vivant = false }
  }, [])

  return identite
}

/**
 * Remplace les `{{variables}}` d'un texte par leur valeur.
 * @returns {string|null} le texte résolu, ou `null` si une variable citée est
 *   vide — l'appelant doit alors retirer la ligne au lieu de l'afficher.
 */
export function resoudre(texte, identite) {
  if (typeof texte !== 'string') return texte
  if (!texte.includes('{{')) return texte

  let manquante = false
  const resolu = texte.replace(/\{\{(\w+)\}\}/g, (_, cle) => {
    const v = identite?.[cle]
    if (!v) { manquante = true; return '' }

    return v
  })

  return manquante ? null : resolu
}

/** Résout une liste, en écartant les entrées dont une valeur manque. */
export function resoudreListe(liste, identite) {
  if (!Array.isArray(liste)) return []

  return liste.map((l) => resoudre(l, identite)).filter((l) => l != null && l !== '')
}

/**
 * Résout un arbre de contenu légal entier (articles, blocs, tableaux, listes).
 *
 * Appliqué UNE fois en amont du rendu plutôt que dans chaque composant : les
 * cinq composants de bloc restent ignorants de l'identité légale, et un futur
 * gabarit `{{...}}` ajouté n'importe où fonctionnera sans toucher au rendu.
 *
 * Règles de retrait, calquées sur les formes réelles des données :
 * - un bloc dont un texte cite une valeur absente disparaît en entier (une
 *   phrase « déclaré sous la délibération n°  » n'a pas de sens tronquée) ;
 * - dans un tableau, c'est la LIGNE entière qui saute — une ligne « RCCM » sans
 *   numéro laisserait une cellule vide, plus troublante qu'une ligne absente ;
 * - dans une liste, seule la puce concernée saute, les autres restent.
 */
export function resoudreArbre(noeud, identite, cle = '') {
  if (typeof noeud === 'string') return resoudre(noeud, identite)
  if (noeud == null || typeof noeud !== 'object') return noeud

  if (Array.isArray(noeud)) {
    // `rows` : chaque entrée est une ligne de tableau. Une cellule manquante
    // condamne la ligne, pas seulement la cellule.
    if (cle === 'rows') {
      return noeud
        .map((ligne) => (Array.isArray(ligne) ? ligne.map((c) => resoudre(c, identite)) : resoudre(ligne, identite)))
        .filter((ligne) => (Array.isArray(ligne) ? ligne.every((c) => c != null) : ligne != null))
    }

    return noeud.map((v) => resoudreArbre(v, identite, cle)).filter((v) => v != null)
  }

  const sortie = {}
  for (const [k, v] of Object.entries(noeud)) {
    const r = resoudreArbre(v, identite, k)
    // Une propriété TEXTE devenue nulle condamne l'objet qui la porte.
    if (r == null && typeof v === 'string') return null
    sortie[k] = r
  }

  return sortie
}
