// Garde-fou : un écran qu'on ne peut pas atteindre.
//
// C'est le défaut le plus fréquent de ce projet — livrer une fonctionnalité
// complète, serveur compris, sans le chemin qui y mène. « Mes Réalisations »
// en est l'exemple : modération, filigrane, quotas, anti-abus et cache hors
// ligne écrits et testés, page importée dans App.jsx… sans <Route> sur mobile
// et sans un seul lien sur le web. Personne ne pouvait l'ouvrir.
//
// Rien ne le signalait : l'application compile, les tests passent, l'écran
// existe. Seul un utilisateur qui le cherche s'en aperçoit — et il ne le
// cherche pas, puisqu'il ignore qu'il existe.
//
// Détecte deux défauts :
//   1. une page IMPORTÉE dans App.jsx mais jamais déclarée en <Route> (code mort) ;
//   2. une route DÉCLARÉE mais vers laquelle aucun lien ne mène (inatteignable
//      autrement qu'en tapant l'adresse).
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Routes atteintes autrement que par un lien de l'application : redirection
// d'un fournisseur externe, lien reçu par courriel, adresse partagée.
const ATTEINTES_AUTREMENT = new Set([
  '/auth/social/callback',   // redirection Google/Facebook après connexion
])

const app = readFileSync('src/App.jsx', 'utf8')

const importes = [...app.matchAll(/^import\s+(\w*Page)\s+from/gm)].map((m) => m[1])
const routes = [...app.matchAll(/element=\{<(\w+)\s*\/?>/g)].map((m) => m[1])

// Chemins déclarés, littéraux ou via la table ROUTES.
const chemins = new Map()
for (const m of app.matchAll(/<Route\s+path=(?:"([^"]+)"|\{ROUTES\.(\w+)\})[^>]*element=\{<(\w+)/g)) {
  chemins.set(m[3], m[1] ?? `ROUTES.${m[2]}`)
}

let table = {}
try {
  const r = readFileSync('src/constants/routes.js', 'utf8')
  for (const m of r.matchAll(/(\w+):\s*'([^']+)'/g)) table[m[1]] = m[2]
} catch {}

const fichiers = []
const parcourir = (d) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    if (statSync(p).isDirectory()) parcourir(p)
    else if (/\.(jsx?|json)$/.test(e) && p !== 'src/App.jsx') fichiers.push(p)
  }
}
parcourir('src')
const source = fichiers.map((f) => readFileSync(f, 'utf8')).join('\n')

const mortes = importes.filter((p) => !routes.includes(p))

const sansLien = []
for (const [page, brut] of chemins) {
  const chemin = brut.startsWith('ROUTES.') ? table[brut.slice(7)] : brut
  if (!chemin || chemin.includes(':') || chemin === '*' || chemin === '/') continue
  const cite = source.includes(`'${chemin}'`) || source.includes(`"${chemin}"`)
    || (brut.startsWith('ROUTES.') && source.includes(brut))
  if (!cite && !ATTEINTES_AUTREMENT.has(chemin)) sansLien.push(`${chemin.padEnd(26)} ${page}`)
}
if (mortes.length === 0 && sansLien.length === 0) {
  process.exit(0)
}

if (mortes.length) {
  console.error('\n\u2716 Pages importées sans <Route> — code mort, écran inatteignable :\n')
  mortes.forEach((p) => console.error(`   ${p}`))
}
if (sansLien.length) {
  console.error('\n\u2716 Routes vers lesquelles aucun lien ne mène :\n')
  sansLien.forEach((l) => console.error(`   ${l}`))
  console.error("\n   Ajouter une entrée de menu, ou inscrire la route dans ATTEINTES_AUTREMENT")
  console.error('   si elle est bien atteinte par une redirection externe.')
}
console.error("\nL'application compilerait, et personne ne pourrait ouvrir cet écran.\n")
process.exit(1)
