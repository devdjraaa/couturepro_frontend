import { API_BASE_URL } from '@/constants/config'

/**
 * Construction du message de partage des mesures — SOURCE UNIQUE.
 *
 * ⚠️ Il existait DEUX constructions concurrentes (une locale « offline-first »,
 * une de repli côté serveur). Selon le chemin emprunté, le message n'avait pas
 * le même contenu : c'est ce qui produisait des partages sans les mesures
 * (constat direction du 20/07). Tout passe désormais par ici.
 *
 * Les coordonnées de la signature viennent du serveur (`/vitrine/coordonnees`,
 * éditables en admin) : un changement de numéro ne demande pas de redéploiement.
 */

let coordonneesCache = null

// Repli utilisé uniquement si le serveur est injoignable : mieux vaut une
// signature légèrement datée qu'un partage sans identité de marque.
const COORDONNEES_REPLI = {
  marque: 'Gextimo',
  site: 'www.gextimo.novafriq.africa',
  telephone: '+229 01 91 47 96 28',
}

export async function getCoordonnees() {
  if (coordonneesCache) return coordonneesCache
  try {
    const r = await fetch(`${API_BASE_URL}/vitrine/coordonnees`, { headers: { Accept: 'application/json' } })
    coordonneesCache = r.ok ? await r.json() : COORDONNEES_REPLI
  } catch {
    coordonneesCache = COORDONNEES_REPLI
  }
  return coordonneesCache
}

/** Libellé lisible d'une mesure : les clés sont saisies librement par l'atelier. */
export function libelleMesure(cle) {
  const t = String(cle).replace(/_/g, ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * @param {object}  params.client   { prenom, nom, telephone }
 * @param {object}  params.champs   { libellé: valeur }
 * @param {string}  params.atelierNom
 * @param {object}  params.coordonnees  résultat de getCoordonnees()
 * @param {string}  params.unite    unité affichée (préférence utilisateur)
 */
export function construireMessageMesures({ client, champs = {}, atelierNom = '', coordonnees, unite = 'cm' }) {
  const c = coordonnees || COORDONNEES_REPLI
  const nom = [client?.prenom, client?.nom].filter(Boolean).join(' ').trim()

  const entrees = Object.entries(champs).filter(([, v]) => v !== null && v !== '' && v !== undefined)

  const lignes = [`📏 *Mesures de ${nom}*${atelierNom ? ` — ${atelierNom}` : ''}`, '']

  if (entrees.length > 0) {
    lignes.push(...entrees.map(([k, v]) => `${libelleMesure(k)} : ${v} ${unite}`))
  } else {
    // Dire explicitement qu'il n'y a rien plutôt qu'envoyer un message qui
    // ressemble à une fiche complète mais vide — c'est ce qui laissait croire
    // que « les mesures ne partent pas ».
    lignes.push('_Aucune mesure enregistrée pour ce client._')
  }

  lignes.push('', `_Exporté le ${new Date().toLocaleDateString('fr-FR')}_`)

  // Pt 6 (lot 2, 20/07) : bloc de signature sur tout partage sortant.
  lignes.push('', `Généré par ${c.marque}`, c.site, `📞 ${c.telephone}`)

  return lignes.join('\n')
}

/** Ouvre WhatsApp avec le message construit. Renvoie false si le numéro manque. */
export async function partagerMesuresWhatsApp({ client, champs, atelierNom, unite }) {
  const phone = String(client?.telephone || '').replace(/\D/g, '')
  if (!phone) return false

  const coordonnees = await getCoordonnees()
  const message = construireMessageMesures({ client, champs, atelierNom, coordonnees, unite })
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')

  return true
}
