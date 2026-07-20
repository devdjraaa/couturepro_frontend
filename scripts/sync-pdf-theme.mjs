// Garde-fou : la page de maquettes doit montrer EXACTEMENT ce que les exports
// produisent. On resynchronise la copie servie et on échoue si elle avait dérivé
// sans être régénérée — une maquette validée qui ne correspond plus au réel
// ferait valider quelque chose d'inexistant.
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = 'src/utils/pdfTheme.js'
const COPIE  = 'public/pdf-v2/pdfTheme.js'
const BANDEAU = `// ⚠️ COPIE SERVIE de ${SOURCE} — ne pas éditer ici.
// Régénérée par \`npm run pdf:maquettes\`. Le script vérifie qu'elle est identique
// à la source : ce que la page de maquettes montre est ce que les exports produisent.
`

const source = readFileSync(SOURCE, 'utf-8')
const attendu = BANDEAU + source

let actuel = ''
try { actuel = readFileSync(COPIE, 'utf-8') } catch { /* première génération */ }

if (actuel !== attendu) {
  writeFileSync(COPIE, attendu)
  console.log('pdfTheme : copie des maquettes resynchronisée sur la source.')
} else {
  console.log('pdfTheme : maquettes et exports déjà alignés.')
}
