#!/usr/bin/env node
/**
 * Garde-fou : aucun hook React appelé APRÈS un `return` dans un composant.
 *
 * React exige que les hooks soient appelés dans le même ordre à chaque rendu.
 * Un hook placé après un `return` conditionnel n'est appelé qu'à partir du
 * second rendu — l'application plante alors avec « Rendered more hooks than
 * during the previous render ». Rien ne le voit venir : la construction passe,
 * ESLint se tait, les tests aussi.
 *
 * Ce défaut a coûté DEUX pannes : la page profil créateur inaccessible 12 h
 * (20/07) et l'application mobile entièrement bloquée (21/07).
 *
 * On raisonne sur l'indentation, que ce projet respecte : un `return` et un
 * `const … = useXxx(` à DEUX espaces sont au premier niveau du composant.
 */
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function fichiers(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) fichiers(p, acc)
    else if (/\.jsx$/.test(e)) acc.push(p)
  }
  return acc
}

const DEBUT_COMPOSANT = /^(?:export default )?function ([A-Z]\w*)\s*\(/
const RETURN_NIVEAU_1 = /^ {2}(?:return\b|if \s*\([^)]*\)\s*return\b)/
const HOOK_NIVEAU_1   = /^ {2}(?:const|let|var)\s+.*=\s*use[A-Z]\w*\(|^ {2}use(?:Effect|LayoutEffect|Memo|Callback|Imperative\w*)\(/

const fautes = []
for (const f of fichiers('src')) {
  const lignes = readFileSync(f, 'utf8').split('\n')
  let composant = null, vuReturn = 0
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i]
    const m = l.match(DEBUT_COMPOSANT)
    if (m) { composant = m[1]; vuReturn = 0; continue }
    if (!composant) continue
    if (/^\}/.test(l)) { composant = null; continue }   // fin du composant
    if (RETURN_NIVEAU_1.test(l)) { vuReturn = i + 1; continue }
    if (vuReturn && HOOK_NIVEAU_1.test(l)) {
      fautes.push(`${f}:${i + 1}  hook dans « ${composant} » après le return de la ligne ${vuReturn}`)
      vuReturn = 0   // une alerte par composant suffit
    }
  }
}

if (fautes.length === 0) {
  console.log('✓ Aucun hook appelé après un return.')
  process.exit(0)
}
console.error(`\n✖ ${fautes.length} hook(s) appelé(s) après un return :\n`)
for (const x of fautes) console.error('   ' + x)
console.error("\nL'écran plantera au second rendu (« Rendered more hooks… »).\n")
process.exit(1)
