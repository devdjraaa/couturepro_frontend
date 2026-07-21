#!/usr/bin/env node
/**
 * Garde-fou : aucune clé de traduction utilisée sans être définie.
 *
 * Une clé manquante ne casse rien — i18n affiche simplement le chemin brut.
 * L'utilisateur lit alors « outils_creatifs.meta.niveau » au lieu de « Choisir
 * le niveau du patron ». Rien ne le signale : la construction passe, ESLint se
 * tait, les tests aussi. C'est la direction qui l'a vu, en ouvrant l'écran.
 *
 * Le jour où le défaut a été relevé (21/07), la même page en portait DEUX :
 * `niveau` et `nb_pieces`. Seul le premier avait été remarqué, parce qu'un menu
 * déroulant se voit plus qu'un champ de saisie.
 *
 * On ne contrôle que les clés écrites en clair — `t('a.b.c')`. Les clés
 * calculées (`t(`x.${v}`)`) sont ignorées : les vérifier demanderait de deviner
 * les valeurs possibles, et un garde-fou qui crie à tort finit désactivé.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const REFERENCE = 'src/lang/fr.json'
const RACINE = 'src'

function fichiers(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) fichiers(p, acc)
    else if (/\.(jsx?|tsx?)$/.test(e)) acc.push(p)
  }
  return acc
}

function aplatir(obj, prefixe = '', acc = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const cle = prefixe ? `${prefixe}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) aplatir(v, cle, acc)
    else acc.add(cle)
  }
  return acc
}

const definies = aplatir(JSON.parse(readFileSync(REFERENCE, 'utf8')))

// `t('cle')` ou `t("cle")` — sans interpolation, et avec au moins un point,
// pour ne pas ramasser les helpers locaux qui s'appellent aussi `t`.
const APPEL = /\bt\(\s*['"]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"]/gi

// i18next choisit la forme selon `count` : `x_one` / `x_other` existent, `x` non.
const PLURIELS = ['_one', '_other', '_zero', '_two', '_few', '_many']

const manquantes = new Map()
for (const f of fichiers(RACINE)) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(APPEL)) {
    const cle = m[1]
    if (definies.has(cle)) continue
    // Forme plurielle : la clé nue n'existe jamais, ses variantes oui.
    if (PLURIELS.some((s) => definies.has(cle + s))) continue
    // Une clé peut désigner un sous-objet entier (ex. une liste rendue par
    // `returnObjects`) : présente comme préfixe, elle est bien définie.
    if ([...definies].some((d) => d.startsWith(cle + '.'))) continue
    // Absence assumée : `defaultValue` fournit le texte de repli, la clé est
    // facultative par construction (contenu optionnel pas encore rédigé).
    const apres = src.slice(m.index, m.index + 200)
    if (/defaultValue/.test(apres)) continue
    if (!manquantes.has(cle)) manquantes.set(cle, f)
  }
}

if (manquantes.size === 0) {
  console.log('✓ Aucune clé de traduction manquante.')
  process.exit(0)
}

console.error(`\n✗ ${manquantes.size} clé(s) de traduction absente(s) de ${REFERENCE} :\n`)
for (const [cle, f] of manquantes) console.error(`   ${cle}\n      ${f}`)
console.error('\nCes clés s\'afficheraient telles quelles à l\'écran.\n')
process.exit(1)
