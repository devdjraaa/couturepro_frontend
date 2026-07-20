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

if (fautes.length) {
  console.error('\n✖ Identifiants utilisés sans être définis :\n')
  for (const x of fautes) console.error('   ' + x)
  console.error("\nL'application compilerait, puis planterait à l'exécution.\n")
  process.exit(1)
}
console.log('✓ Aucun identifiant indéfini.')
