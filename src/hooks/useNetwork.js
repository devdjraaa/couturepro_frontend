import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'

/**
 * Détecte l'état réseau.
 * - Sur Android (Capacitor) : utilise @capacitor/network (événements natifs)
 * - Sur web : utilise navigator.onLine + événements 'online'/'offline'
 *
 * @returns {{ isOnline: boolean, isNative: boolean }}
 */
export function useNetwork() {
  const isNative = Capacitor.isNativePlatform()
  const [isOnline, setIsOnline] = useState(() =>
    isNative ? true : navigator.onLine,
  )

  useEffect(() => {
    if (isNative) {
      // Lire l'état initial via Capacitor
      Network.getStatus().then(status => setIsOnline(status.connected))

      // Écouter les changements natifs
      let listenerHandle
      Network.addListener('networkStatusChange', status => {
        setIsOnline(status.connected)
      }).then(handle => {
        listenerHandle = handle
      })

      return () => {
        listenerHandle?.remove()
      }
    }

    // Fallback web
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [isNative])

  return { isOnline, isNative }
}
