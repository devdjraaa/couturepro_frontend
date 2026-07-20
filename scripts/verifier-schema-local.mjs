/**
 * Cohérence entre le schéma WatermelonDB et ses migrations.
 *
 * Une migration mal formée ne casse pas le build : elle échoue à l'ouverture de
 * la base SUR L'APPAREIL, et WatermelonDB repart alors d'une base vide — les
 * écritures locales non synchronisées sont perdues. Le défaut n'apparaît donc
 * qu'en production, chez l'utilisateur.
 *
 * Ce contrôle a déjà rattrapé une corruption réelle : un bloc de migration
 * inséré AU MILIEU d'un autre. Fichier syntaxiquement valide, build passant,
 * base locale détruite au premier lancement.
 *
 * Les fonctions de WatermelonDB sont REMPLACÉES par des doublures plutôt
 * qu'importées : la bibliothèque ne s'importe pas depuis Node (imports de
 * répertoire), et ajouter `vite-node` en dépendance salirait le node_modules
 * partagé avec la branche master, dont le build ne connaît pas ce script. Les
 * doublures suffisent : ce qu'on vérifie ici est la STRUCTURE.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ici = dirname(fileURLToPath(import.meta.url))
const src = (f) => resolve(ici, '..', 'src', 'db', f)

/** Évalue un module en neutralisant ses imports, avec les doublures fournies. */
function evaluer(fichier, doublures) {
  const code = readFileSync(src(fichier), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/export default /, 'return ')

  return new Function(...Object.keys(doublures), code)(...Object.values(doublures))
}

const schema = evaluer('schema.js', {
  appSchema: (s) => s,
  tableSchema: (t) => t,
})

const migrations = evaluer('migrations.js', {
  schemaMigrations: (m) => m,
  createTable: (t) => ({ type: 'create_table', ...t }),
  addColumns: (c) => ({ type: 'add_columns', ...c }),
})

const nomsTables = schema.tables.map((t) => t.name)
const versions = migrations.migrations.map((m) => m.toVersion)

console.log(`  schéma v${schema.version} — ${nomsTables.length} tables`)
console.log(`  migrations : ${versions.join(', ')}`)

let ok = true
const echec = (msg) => { console.error(`  ✗ ${msg}`); ok = false }

// 1. Chaque version depuis la 2 doit avoir sa migration, sinon WatermelonDB
//    refuse de migrer et repart d'une base vide.
for (let v = 2; v <= schema.version; v++) {
  if (!versions.includes(v)) echec(`aucune migration vers la version ${v}`)
}

// 2. L'ordre croissant est la convention de ce fichier ; un désordre signale
//    presque toujours une insertion au mauvais endroit.
if (versions.some((v, i) => i > 0 && v <= versions[i - 1])) {
  echec(`les migrations ne sont pas en ordre croissant : ${versions.join(', ')}`)
}

// 3. Une base migrée depuis la v1 doit aboutir EXACTEMENT au schéma déclaré.
//
//    On rejoue donc les migrations dans l'ordre et on cumule les colonnes :
//    regarder la seule étape `createTable` donnerait un faux positif dès qu'une
//    colonne a été ajoutée plus tard par `addColumns` — cas de
//    `notifications.lien`, créée en v2 puis complétée en v5.
//    Seules les tables CRÉÉES par une migration sont comparées : celles du
//    schéma d'origine (version 1) ne sont créées par aucune migration — les
//    inclure signalerait à tort toutes leurs colonnes comme manquantes.
const construites = new Map()

for (const m of migrations.migrations) {
  for (const etape of m.steps ?? []) {
    if (etape.type === 'create_table') {
      construites.set(etape.name, new Set(etape.columns.map((c) => c.name)))
    } else if (etape.type === 'add_columns' && construites.has(etape.table)) {
      etape.columns.forEach((c) => construites.get(etape.table).add(c.name))
    }
  }
}

for (const [nom, colonnes] of construites) {
  const dansSchema = schema.tables.find((t) => t.name === nom)
  if (!dansSchema) {
    echec(`les migrations créent « ${nom} », absente du schéma`)
    continue
  }

  const manquantes = dansSchema.columns.map((c) => c.name).filter((c) => !colonnes.has(c))
  if (manquantes.length) {
    echec(`« ${nom} » : colonnes du schéma qu'aucune migration ne crée — ${manquantes.join(', ')}`)
  }
}

console.log(ok ? '✓ Schéma local cohérent.' : '✗ Schéma local INCOHÉRENT.')
process.exit(ok ? 0 : 1)
