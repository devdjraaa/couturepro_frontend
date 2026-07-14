// Notifications push FCM (temps réel, même app fermée).
//  - Demande la permission, enregistre l'appareil auprès de FCM,
//  - envoie le token au backend (/devices) pour l'associer à l'utilisateur,
//  - au tap sur une push, redirige vers l'écran lié (data.lien).
// Le plugin n'existe que dans l'APK (natif) ; sur le web, tout est no-op.
import { IS_NATIVE } from '@/constants/routes'
import api from '@/services/api'
import { goToDeepLink } from './deepLink'
import { showLocalNotif } from './localNotif'

let started = false
let lastToken = null

// Enregistre (ou ré-enregistre) le token courant côté backend. Appelable après login.
export async function registerPushToken() {
  if (!IS_NATIVE || !lastToken) return
  try { await api.post('/notifications/fcm-token', { fcm_token: lastToken, platform: 'android' }) } catch { /* réessai au prochain lancement */ }
}

export async function initPush() {
  if (!IS_NATIVE || started) return
  started = true
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    let perm = await PushNotifications.checkPermissions()
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions()
    }
    if (perm.receive !== 'granted') return

    PushNotifications.addListener('registration', (token) => {
      lastToken = token?.value || null
      registerPushToken()
    })
    PushNotifications.addListener('registrationError', () => { /* silencieux */ })

    // Push reçue app OUVERTE (premier plan) : Android ne l'affiche pas seul →
    // on la montre nous-mêmes dans le rideau (via notif locale).
    PushNotifications.addListener('pushNotificationReceived', (notif) => {
      const title = notif?.title || notif?.data?.title || 'Gextimo'
      const body  = notif?.body  || notif?.data?.body  || ''
      const lien  = notif?.data?.lien || null
      showLocalNotif(title, body, { lien })
    })

    // Tap sur une push (app en arrière-plan/fermée) → deep-link vers l'écran lié.
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const lien = action?.notification?.data?.lien
      if (lien) goToDeepLink(lien)
    })

    await PushNotifications.register()
  } catch { /* plugin absent : rien */ }
}
