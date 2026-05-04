import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

const DEVICE_KEY = 'cp_device_id'

/**
 * Retourne un identifiant d'appareil stable.
 * Native Android : utilise Device.getId() (identifiant fourni par le système).
 * Web           : génère un UUID et le persiste dans localStorage.
 */
export async function getStableDeviceId() {
  if (Capacitor.isNativePlatform()) {
    const info = await Device.getId()
    return info.identifier
  }

  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}
