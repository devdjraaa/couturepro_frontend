import { Database }      from '@nozbe/watermelondb'
import * as LokiAdapterMod from '@nozbe/watermelondb/adapters/lokijs'
import { setGenerator }  from '@nozbe/watermelondb/utils/common/randomId'
import schema           from './schema'
import { Client, Commande, Mesure, Vetement } from './models'

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

const adapter = new LokiJSAdapter({
  schema,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  dbName: 'couturepro',
  onQuotaExceededError: () => {
    console.warn('[WatermelonDB] Quota IndexedDB dépassé')
  },
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Erreur setup adapter', error)
  },
})

const database = new Database({
  adapter,
  modelClasses: [Client, Commande, Mesure, Vetement],
})

export default database
