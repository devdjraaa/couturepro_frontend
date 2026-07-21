#!/usr/bin/env node
/**
 * Garde-fou : aucun identifiant utilisé sans être défini.
 *
 * Vite compile sans broncher un fichier qui référence un nom inexistant, et
 * l'application ne casse qu'à l'exécution — écran blanc ou écran de secours.
 * Ce défaut a coûté quatre pannes le 20/07 :
 *   · `Images`, `Ruler`, `Plus`, `VasatPage` perdus en résolvant des conflits ;
 *   · `APP_TARGET`, qui n'existe que sur la branche android, utilisé sur le web ;
 *   · `t` appelé dans des composants sans `useTranslation` — dont la modale du
 *     menu de Makila, qui plantait le chat ;
 *   · `buildFactureHtml`, disparu d'un refactor en laissant ses trois appels.
 *
 * ESLint sait tout cela : la règle `no-undef` était DÉJÀ active mais personne ne
 * la lisait, noyée sous 130 avertissements de style. On ne contrôle donc QUE
 * cette règle — un garde-fou qu'on ignore ne sert à rien.
 */
import { execFileSync } from 'child_process'

let sortie = ''
try {
  sortie = execFileSync('npx', ['eslint', 'src', '--format', 'json'], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  })
} catch (e) {
  // ESLint sort en code 1 dès qu'il trouve une erreur : le rapport reste valide.
  sortie = e.stdout || ''
}

let rapport = []
try { rapport = JSON.parse(sortie) } catch {
  console.error('✖ Rapport ESLint illisible — contrôle des identifiants ignoré.')
  process.exit(0)   // ne jamais bloquer un build sur une panne de l'outil
}

const fautes = []
for (const f of rapport) {
  for (const m of f.messages) {
    if (m.ruleId === 'no-undef') {
      fautes.push(`${f.filePath.replace(process.cwd() + '/', '')}:${m.line}  ${m.message}`)
    }
  }
}

// Deuxième classe, qu'ESLint ne signale pas ici : un identifiant importé DEUX
// fois. Le build s'arrête dessus, mais autant l'annoncer au même endroit et
// dans les mêmes termes que les identifiants manquants.
import fs from 'fs'
import path from 'path'

const doublons = []
;(function parcourir(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { parcourir(p); continue }
    if (!/\.jsx?$/.test(e.name)) continue
    const src = fs.readFileSync(p, 'utf8')
    const vus = new Map()
    for (const r of src.matchAll(/^import\s+(?:\{([^}]*)\}|([A-Za-z_$][\w$]*))\s+from/gm)) {
      const noms = r[1] ? r[1].split(',').map((x) => x.trim().split(/\s+as\s+/).pop()) : [r[2]]
      for (const n of noms.filter(Boolean)) vus.set(n, (vus.get(n) || 0) + 1)
    }
    for (const [n, c] of vus) if (c > 1) doublons.push(`${p}  '${n}' importé ${c} fois`)
  }
})('src')

// TROISIÈME classe, et le vrai angle mort : un COMPOSANT JSX utilisé sans être
// importé. `no-undef` ne le voit pas — il faudrait `react/jsx-no-undef`, qui
// vient avec `eslint-plugin-react`, absent d'ici. Le 21/07, un
// `<RessourceIntrouvable />` sans son import a passé la construction, passé ce
// garde-fou, et n'a planté que sur l'appareil.
const jsxInconnus = []
;(function parcourirJsx(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) { parcourirJsx(p); continue }
    if (!/\.jsx$/.test(e.name)) continue

    // Les commentaires portent souvent des exemples de balises : les garder
    // ferait crier le garde-fou à tort, et un garde-fou bruyant finit ignoré.
    const src = fs.readFileSync(p, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')

    const connus = new Set()
    for (const r of src.matchAll(/^import\s+(?:\{([^}]*)\}|([A-Za-z_$][\w$]*))(?:\s*,\s*\{([^}]*)\})?\s+from/gm)) {
      for (const groupe of [r[1], r[3]]) {
        if (groupe) for (const n of groupe.split(',')) connus.add(n.trim().split(/\s+as\s+/).pop())
      }
      if (r[2]) connus.add(r[2])
    }
    // Défini sur place : composant local, constante, classe.
    for (const r of src.matchAll(/(?:^|\n)\s*(?:export\s+default\s+|export\s+)?(?:function|class|const|let)\s+([A-Z][\w$]*)/g)) {
      connus.add(r[1])
    }
    // Reçu par déstructuration, très courant pour les icônes : `{ icon: Icon }`
    // en paramètre de composant ou dans un `.map()`. Sans ça le garde-fou criait
    // sur quatre écrans parfaitement sains.
    for (const r of src.matchAll(/:\s*([A-Z][\w$]*)/g)) connus.add(r[1])
    // Déstructuré depuis un TABLEAU : `.map(([cle, Icone]) => …)`.
    for (const r of src.matchAll(/\[([^\[\]]*)\]\s*(?:=[^=>]|=>|\))/g)) {
      for (const n of r[1].split(',')) {
        const nom = n.trim()
        if (/^[A-Z][\w$]*$/.test(nom)) connus.add(nom)
      }
    }
    // Déstructuré sans renommage : `const { Provider } = ...`, `({ Icone })`.
    for (const r of src.matchAll(/\{([^{}]*)\}\s*(?:=[^=>]|=>|\))/g)) {
      for (const n of r[1].split(',')) {
        const nom = n.trim().split(/[:=\s]/)[0]
        if (/^[A-Z][\w$]*$/.test(nom)) connus.add(nom)
      }
    }

    for (const r of src.matchAll(/<([A-Z][\w$]*)/g)) {
      const nom = r[1]
      if (connus.has(nom)) continue
      const ligne = src.slice(0, r.index).split('\n').length
      jsxInconnus.push(`${p}:${ligne}  <${nom}> utilisé sans import ni définition`)
    }
  }
})('src')

if (jsxInconnus.length) {
  console.error('\n✖ Composants JSX utilisés sans être définis :\n')
  for (const x of [...new Set(jsxInconnus)]) console.error('   ' + x)
  console.error('')
}

if (doublons.length) {
  console.error('\n✖ Identifiants importés plusieurs fois :\n')
  for (const x of doublons) console.error('   ' + x)
  console.error('')
}

if (fautes.length || doublons.length || jsxInconnus.length) {
  if (fautes.length) {
    console.error('\n✖ Identifiants utilisés sans être définis :\n')
    for (const x of fautes) console.error('   ' + x)
  }
  console.error("\nL'application compilerait, puis planterait à l'exécution.\n")
  process.exit(1)
}
console.log('✓ Aucun identifiant indéfini.')
