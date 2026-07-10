import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { goToDeepLink } from './deepLink'

// Canal HIGH (heads-up) : la notif pop par-dessus les autres apps + son + vibration,
// exactement comme une notif native (WhatsApp/Instagram). Nouveau nom d'ID car Android
// fige l'importance d'un canal existant (l'ancien 'couturepro_actions' était en DEFAULT).
const CHANNEL_ID = 'gextimo_alertes'
let _channelCreated = false
let _nextId = 3000
let _tapListenerAdded = false
// Suivi par IDs des notifs déjà signalées au rideau (robuste, indépendant des dates).
const NOTIFIED_KEY = 'gx_notified_ids'
const INIT_KEY      = 'gx_notif_init'

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
      name:        'Alertes Gextimo',
      description: 'Nouveaux devis, avis, commandes, échéances…',
      importance:  5,          // MAX → heads-up (pop par-dessus les autres apps) + son
      visibility:  1,
      sound:       'default',
      vibration:   true,
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
  if (!Capacitor.isNativePlatform() || !Array.isArray(notifs) || !notifs.length) return []

  const ids = notifs.map(n => n.id).filter(Boolean)

  let notified
  try { notified = new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')) }
  catch { notified = new Set() }

  // Premier passage (1er login / installation) : on mémorise les notifs existantes
  // SANS notifier, pour éviter une rafale d'anciennes notifications.
  if (!localStorage.getItem(INIT_KEY)) {
    try {
      localStorage.setItem(NOTIFIED_KEY, JSON.stringify(ids.slice(0, 300)))
      localStorage.setItem(INIT_KEY, '1')
    } catch { /* indisponible */ }
    return []
  }

  // Nouvelles = non lues ET jamais signalées. Limite anti-spam : 5 max par sync.
  const fresh = notifs.filter(n => n.id && !n.is_read && !notified.has(n.id)).slice(0, 5)

  for (const n of fresh) {
    await showLocalNotif(n.titre || 'Gextimo', n.contenu || '', { lien: n.lien || null })
    notified.add(n.id)
  }

  // Mémoriser toutes les notifs vues (y compris déjà lues) pour ne jamais re-notifier.
  ids.forEach(id => notified.add(id))
  try { localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified].slice(-300))) }
  catch { /* indisponible */ }

  // On renvoie les nouvelles notifs (forme simple) pour la bannière in-app (premier plan).
  return fresh.map(n => ({ titre: n.titre, contenu: n.contenu, lien: n.lien }))
}
