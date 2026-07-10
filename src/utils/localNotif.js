import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { goToDeepLink } from './deepLink'

const CHANNEL_ID = 'couturepro_actions'
let _channelCreated = false
let _nextId = 3000
let _tapListenerAdded = false
const LAST_NOTIF_KEY = 'gx_last_notif_at'

// Tap sur une notification du rideau → redirige vers l'écran lié (extra.lien).
async function ensureTapListener() {
  if (_tapListenerAdded || !Capacitor.isNativePlatform()) return
  _tapListenerAdded = true
  try {
    await LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
      const lien = e?.notification?.extra?.lien
      if (lien) goToDeepLink(lien)
    })
  } catch { /* plateforme non native */ }
}

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

  await ensureTapListener()
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

/**
 * Lève une notification locale (rideau) pour chaque notification système ARRIVÉE
 * depuis le dernier passage. Remplace le push FCM : appelée après chaque synchro.
 *
 * @param {Array} notifs — enregistrements { titre, contenu, lien, date_creation, is_read }
 */
export async function raiseSystemNotifications(notifs) {
  if (!Capacitor.isNativePlatform() || !Array.isArray(notifs)) return

  const dated = notifs
    .filter(n => n?.date_creation)
    .sort((a, b) => String(a.date_creation).localeCompare(String(b.date_creation)))
  if (!dated.length) return

  const newest = String(dated[dated.length - 1].date_creation)

  let last = null
  try { last = localStorage.getItem(LAST_NOTIF_KEY) } catch { /* indisponible */ }

  // Premier passage : on mémorise la référence sans notifier (évite une rafale
  // d'anciennes notifications au premier login / à l'installation).
  if (!last) {
    try { localStorage.setItem(LAST_NOTIF_KEY, newest) } catch { /* indisponible */ }
    return
  }

  const fresh = dated.filter(n => String(n.date_creation) > last && !n.is_read)
  // Limite anti-spam : au plus 5 notifs rideau par sync.
  for (const n of fresh.slice(-5)) {
    await showLocalNotif(n.titre || 'Gextimo', n.contenu || '', { lien: n.lien || null })
  }

  try { localStorage.setItem(LAST_NOTIF_KEY, newest) } catch { /* indisponible */ }
}
