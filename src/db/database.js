import { Database }      from '@nozbe/watermelondb'
import * as LokiAdapterMod from '@nozbe/watermelondb/adapters/lokijs'
import schema           from './schema'
import { Client, Commande, Mesure, Vetement } from './models'

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
