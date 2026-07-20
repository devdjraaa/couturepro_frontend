#!/usr/bin/env node
/**
 * Garde-fou : toute icône lucide utilisée doit être importée.
 *
 * Le build ne voit PAS ce défaut — Vite compile sans broncher et l'application
 * ne casse qu'à l'exécution, sur un écran blanc. C'est exactement ce qui est
 * arrivé le 20/07 après le réalignement des branches : trois imports perdus en
 * résolvant des conflits (`Images`, `Ruler`, `Plus`), un APK qui compilait, et
 * une application inutilisable au premier lancement.
 *
 * Ce script rattrape la classe entière du problème, pas seulement ces trois cas.
 */
import fs from 'fs'
import path from 'path'

const RACINE = 'src'
const fichiers = []
;(function parcourir(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) parcourir(p)
    else if (/\.jsx?$/.test(e.name)) fichiers.push(p)
  }
})(RACINE)

const manques = []

for (const f of fichiers) {
  let s = fs.readFileSync(f, 'utf8')
  // Les commentaires citent souvent des composants à titre d'explication :
  // les compter donnerait de faux positifs et discréditerait ce garde-fou.
  s = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const m = s.match(/import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/s)
  const importes = new Set(
    (m ? m[1].split(',') : []).map((x) => x.trim().split(/\s+as\s+/).pop()).filter(Boolean),
  )

  // Usages en tant que composant JSX, ou passés en valeur d'une prop `icon`/`Icone`.
  const usages = new Set()
  for (const r of s.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) usages.add(r[1])
  for (const r of s.matchAll(/\b(?:icon|Icone|icone)\s*[:=]\s*\{?\s*([A-Z][A-Za-z0-9]*)/g)) usages.add(r[1])

  for (const u of usages) {
    if (importes.has(u)) continue

    // `Icon` / `Icone` : nom de PROP par convention dans ce projet, reçu par
    // destructuration (`{ icon: Icon }`). Jamais une icône importée.
    if (/^Icon(e)?(Right|Left)?$/.test(u)) continue

    // Défini, destructuré, ou importé autrement (dont `lazy(() => import(...))`)
    // dans ce fichier : ce n'est pas un import manquant.
    const defini = new RegExp(
      `(?:function|const|let|class)\\s+${u}\\b`      // déclaration
      + `|import[^\\n]*\\b${u}\\b`                  // import quelconque
      + `|\\b${u}\\s*[,}]`                            // destructuration
      + `|\\b${u}\\s*:`                               // renommage { x: U }
    ).test(s)
    if (!defini) manques.push(`${f} → ${u}`)
  }
}

// Deuxième classe d'erreur, rencontrée le 20/07 en fusionnant : un identifiant
// importé DEUX fois. Le build s'arrête dessus, mais autant le dire clairement
// et au même endroit que les imports manquants.
const doublons = []
for (const f of fichiers) {
  const s = fs.readFileSync(f, 'utf8')
  const vus = new Map()
  for (const r of s.matchAll(/^import\s+(?:\{([^}]*)\}|([A-Za-z_$][\w$]*))\s+from/gm)) {
    const noms = r[1] ? r[1].split(',').map((x) => x.trim().split(/\s+as\s+/).pop()) : [r[2]]
    for (const n of noms.filter(Boolean)) {
      vus.set(n, (vus.get(n) || 0) + 1)
    }
  }
  for (const [n, c] of vus) if (c > 1) doublons.push(`${f} → ${n} (${c} fois)`)
}

if (doublons.length) {
  console.error('\n✖ Identifiants importés plusieurs fois :\n')
  for (const x of doublons) console.error('   ' + x)
  console.error('')
}

if (manques.length || doublons.length) {
  if (manques.length) {
    console.error('\n✖ Icônes utilisées mais jamais importées :\n')
    for (const x of manques) console.error('   ' + x)
  }
  console.error('\nL\'application compilerait, puis planterait à l\'écran blanc.\n')
  process.exit(1)
}
console.log('✓ Toutes les icônes utilisées sont importées.')
