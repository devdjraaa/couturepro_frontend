import { Database }      from '@nozbe/watermelondb'
import LokiJSAdapter    from '@nozbe/watermelondb/adapters/lokijs'
import schema           from './schema'
import { Client, Commande, Mesure, Vetement } from './models'

const adapter = new LokiJSAdapter({
  schema,
  // Persiste dans IndexedDB (disponible dans le WebView Android Capacitor)
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
