/**
 * Charge chaque page dans un vrai navigateur et compte les écrans d'erreur.
 *
 * Pourquoi ce script existe : le 20/07, la page profil créateur a été
 * inaccessible pendant douze heures. Un `useState` placé après un `return` de
 * chargement — React comptait plus de hooks au second rendu qu'au premier et
 * refusait de rendre. Le build passait, les 63 tests passaient, ESLint ne
 * disait rien. **Seul l'affichage réel révèle ce genre de faute**, et personne
 * n'avait ouvert la page après l'avoir modifiée.
 *
 * Ce contrôle ne remplace pas les tests : il répond à une question qu'aucun
 * test ne pose — « est-ce que la page s'ouvre ? ».
 *
 * Usage :
 *   npm run dev            (dans un autre terminal)
 *   node scripts/verifier-pages.mjs
 *   node scripts/verifier-pages.mjs https://gextimo.novafriq.africa
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:5173'

// Texte de l'écran d'erreur (ErrorBoundary). S'il change, adapter ici.
const ECRAN_ERREUR = 'Une erreur est survenue'

// En dessous, la page n'a rien rendu du tout — page blanche.
const TAILLE_MIN = 2000

const PAGES = [
  '/', '/createurs', '/qui-sommes-nous', '/aide', '/artisans', '/partenaires',
  '/favoris', '/inscription', '/mise-en-avant', '/espace-client', '/premium', '/suivi',
  '/confidentialite', '/mentions-legales', '/cookies', '/protection-donnees', '/cgu',
  '/droits-createurs', '/conditions-vente', '/produits-interdits', '/livraison-retours',
  '/regles-communaute', '/contact-reclamations',
  '/admin/login',
]

function navigateur() {
  for (const c of ['/usr/bin/brave-browser', '/usr/bin/chromium', '/usr/bin/google-chrome']) {
    if (existsSync(c)) return c
  }

  return null
}

const bin = navigateur()
if (!bin) {
  // Sans navigateur, on n'échoue pas : le contrôle est un filet, pas un péage.
  console.log('⏭️  Aucun navigateur sans interface trouvé — contrôle des pages ignoré.')
  process.exit(0)
}

const dossier = mkdtempSync(join(tmpdir(), 'gx-pages-'))
const echecs = []

console.log(`Contrôle de ${PAGES.length} pages sur ${BASE}\n`)

for (const page of PAGES) {
  const sortie = join(dossier, 'p.html')
  let html = ''

  try {
    html = execFileSync(bin, [
      '--headless', '--disable-gpu', '--no-sandbox',
      '--virtual-time-budget=7000', '--dump-dom', `${BASE}${page}`,
    ], { encoding: 'utf8', timeout: 45000, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    echecs.push([page, 'page injoignable'])
    console.log(`  ✗ ${page} — injoignable`)
    continue
  }

  if (html.includes(ECRAN_ERREUR)) {
    echecs.push([page, "écran d'erreur"])
    console.log(`  ✗ ${page} — écran d'erreur`)
  } else if (html.length < TAILLE_MIN) {
    echecs.push([page, 'page vide'])
    console.log(`  ✗ ${page} — page vide (${html.length} o)`)
  } else {
    console.log(`  ok ${page}`)
  }
}

rmSync(dossier, { recursive: true, force: true })

if (echecs.length) {
  console.error(`\n✗ ${echecs.length} page(s) ne s'affichent pas :`)
  echecs.forEach(([p, r]) => console.error(`   ${p} — ${r}`))
  console.error('\nRelancez `npm run dev` et ouvrez la page : la console du navigateur')
  console.error('donne l\'erreur React exacte, que le build ne peut pas voir.')
  process.exit(1)
}

console.log(`\n✓ Les ${PAGES.length} pages s'affichent.`)
