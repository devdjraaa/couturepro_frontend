import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const CHANNEL_ID = 'couturepro_actions'
let _channelCreated = false
let _nextId = 3000

async function ensureReady() {
  if (!Capacitor.isNativePlatform()) return false

  const { display } = await LocalNotifications.checkPermissions()
  if (display !== 'granted') {
    const { display: after } = await LocalNotifications.requestPermissions()
    if (after !== 'granted') return false
  }

  if (!_channelCreated) {
    await LocalNotifications.createChannel({
      id:          CHANNEL_ID,
      name:        'Activités',
      description: "Confirmations des actions dans l'application",
      importance:  3,
      visibility:  1,
      sound:       'default',
      vibration:   false,
    })
    _channelCreated = true
  }

  return true
}

export async function showLocalNotif(title, body, extra = {}) {
  const ready = await ensureReady()
  if (!ready) return
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id:        _nextId++,
        channelId: CHANNEL_ID,
        title,
        body,
        smallIcon: 'ic_stat_notify',   // logo Gextimo (silhouette) — sinon icône Android par défaut
        iconColor: '#e11d2a',          // teinte de l'icône dans la barre de notif
        schedule:  { at: new Date(Date.now() + 500), allowWhileIdle: true },
        extra,
      }],
    })
  } catch { /* simulateur ou permission révoquée entre-temps */ }
}
