import { Q } from '@nozbe/watermelondb'
import database from '@/db/database'
import { realisationService } from './realisationService'

/**
 * REL-3 — Cache hors ligne de « Mes Réalisations ».
 *
 * Cache TRAVERSANT : en ligne on interroge le serveur et on écrit le résultat
 * en local ; hors ligne on sert le local. L'écran ne connaît qu'une fonction,
 * et reçoit dans les deux cas la même forme de données.
 *
 * Lecture seule, délibérément. Créer une réalisation suppose d'envoyer des
 * photos, donc une file de fichiers à téléverser, une reprise après coupure et
 * une résolution de conflits — un chantier à part entière. Le besoin réel en
 * atelier est de CONSULTER ses brouillons et ses dossiers en attente sans
 * réseau ; c'est ce que couvre ce cache.
 */

// Plafond du cache. Au-delà, on garde les plus utiles : un atelier consulte ses
// brouillons et ses dossiers en attente, pas ses publications d'il y a six mois
// (celles-ci sont de toute façon visibles sur son profil public).
const MAX_CACHE = 100

// Priorité de conservation quand le plafond est atteint.
const PRIORITE = { brouillon: 0, en_attente: 1, refusee: 2, publiee: 3 }

const collection = () => database.get('realisations')

/** Forme commune servie à l'écran, que la source soit le réseau ou le cache. */
function versEcran(r) {
  return {
    id: r.id,
    titre: r.titre,
    description: r.description,
    statut: r.statut,
    images: r.images,
    motif_refus: r.motif_refus,
    soumis_at: r.soumis_at,
    publie_at: r.publie_at,
    created_at: r.date_creation,
    hors_ligne: true,
  }
}

/** Écrit la liste reçue du serveur dans le cache local, en un seul lot. */
export async function enregistrer(realisations) {
  const gardees = [...realisations]
    .sort((a, b) => (PRIORITE[a.statut] ?? 9) - (PRIORITE[b.statut] ?? 9))
    .slice(0, MAX_CACHE)

  await database.write(async () => {
    // On repart d'un cache vide plutôt que de rapprocher ligne à ligne : la
    // liste du serveur fait autorité, et une réalisation supprimée ailleurs
    // doit disparaître d'ici. Le volume (100 lignes) rend le coût négligeable.
    const anciennes = await collection().query().fetch()
    await Promise.all(anciennes.map((r) => r.destroyPermanently()))

    await Promise.all(gardees.map((src) => collection().create((r) => {
      r._raw.id = src.id            // même identifiant qu'en ligne : les écrans
                                    // et les liens continuent de fonctionner
      r.titre = src.titre ?? ''
      r.description = src.description ?? ''
      r.statut = src.statut ?? 'brouillon'
      r.images = src.images ?? []
      r.motif_refus = src.motif_refus ?? null
      r.soumis_at = src.soumis_at ?? null
      r.publie_at = src.publie_at ?? null
      r.date_creation = src.created_at ?? null
      r.atelier_id = src.atelier_id ?? ''
      r.synced_at = Date.now()
    })))
  })
}

/** Contenu du cache, dans l'ordre d'affichage de l'écran. */
export async function lire() {
  const lignes = await collection().query(Q.sortBy('statut', Q.asc)).fetch()

  return lignes
    .map(versEcran)
    .sort((a, b) => (PRIORITE[a.statut] ?? 9) - (PRIORITE[b.statut] ?? 9))
}

/** Date de la dernière mise en cache — l'écran l'affiche quand il sert du local. */
export async function derniereSynchro() {
  const lignes = await collection().query().fetch()
  const dates = lignes.map((r) => r.synced_at).filter(Boolean)

  return dates.length ? new Date(Math.max(...dates)) : null
}

/**
 * Liste des réalisations, réseau d'abord et cache en repli.
 *
 * Le repli ne se déclenche que sur une panne de RÉSEAU. Une erreur métier
 * (session expirée, droits insuffisants) doit remonter telle quelle : servir un
 * cache derrière un 401 laisserait croire que tout va bien alors que
 * l'utilisateur est déconnecté.
 */
export async function listerAvecCache() {
  try {
    const d = await realisationService.list()
    const items = d?.realisations ?? d?.data ?? []
    // La mise en cache ne doit jamais faire échouer un chargement réussi.
    enregistrer(items).catch(() => {})

    return { items, quota: d?.quota ?? null, horsLigne: false }
  } catch (err) {
    const reseau = !err?.response

    if (!reseau) throw err

    const items = await lire()

    return { items, quota: null, horsLigne: true, depuis: await derniereSynchro() }
  }
}
