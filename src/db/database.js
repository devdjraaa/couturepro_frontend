import { Database }      from '@nozbe/watermelondb'
import * as LokiAdapterMod from '@nozbe/watermelondb/adapters/lokijs'
import { setGenerator }  from '@nozbe/watermelondb/utils/common/randomId'
import schema           from './schema'
import migrations       from './migrations'
import { Client, Commande, Mesure, Vetement, Collection, Notification, Paiement } from './models'

// Les enregistrements créés hors-ligne sont poussés au serveur AVEC leur id local.
// Le backend stocke les id en colonnes `uuid` : un id WatermelonDB par défaut
// (ex: "IHuZ2OIaIv2FJn2f") fait échouer l'insertion serveur (uuid invalide) — le
// record est alors perdu côté serveur tout en étant marqué « synced » en local.
// On force donc des UUID valides dès la création locale.
setGenerator(() => crypto.randomUUID())

// Vite/Rolldown wrap les CJS modules : `default.default` peut être nécessaire
const LokiJSAdapter =
  LokiAdapterMod.default?.default ||
  LokiAdapterMod.default ||
  LokiAdapterMod

// L'adaptateur LokiJS incrémental ne crée pas les tables ajoutées par migration
// sur une base existante. Comme TOUTES les données sont re-synchronisables depuis
// le serveur, on versionne le nom de la base : à chaque changement de schéma qui
// ajoute des tables, on repart d'une base fraîche (re-sync automatique). L'ancienne
// est supprimée pour ne pas gaspiller de l'espace.
const DB_NAME = 'couturepro_v2'
try {
  if (typeof indexedDB !== 'undefined' && localStorage.getItem('cp_wm_db') !== DB_NAME) {
    indexedDB.deleteDatabase('couturepro')
    localStorage.removeItem('cp_wm_last_pulled_at')
    localStorage.setItem('cp_wm_db', DB_NAME)
  }
} catch { /* ignore */ }

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: DB_NAME,
  onQuotaExceededError: () => {
    console.warn('[WatermelonDB] Quota IndexedDB dépassé')
  },
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Erreur setup adapter', error)
  },
})

const database = new Database({
  adapter,
  modelClasses: [Client, Commande, Mesure, Vetement, Collection, Notification, Paiement],
})

export default database
