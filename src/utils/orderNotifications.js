import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const CHANNEL_ID = 'couturepro_orders'

async function ensurePermission() {
  const { display } = await LocalNotifications.checkPermissions()
  if (display === 'granted') return true
  const { display: after } = await LocalNotifications.requestPermissions()
  return after === 'granted'
}

async function ensureChannel() {
  await LocalNotifications.createChannel({
    id:          CHANNEL_ID,
    name:        'Commandes',
    description: 'Alertes livraison et retard',
    importance:  4, // HIGH
    visibility:  1,
    sound:       'default',
    vibration:   true,
  })
}

/**
 * Planifie (ou re-planifie) les notifications de livraison pour les commandes en cours.
 * À appeler au démarrage de l'app et après chaque sync.
 *
 * @param {Array} commandes — liste complète des commandes (toutes statuts)
 * @param {string} atelierNom — nom de l'atelier, pour personnaliser le texte
 */
export async function scheduleOrderNotifications(commandes, atelierNom = 'votre atelier') {
  if (!Capacitor.isNativePlatform()) return

  const allowed = await ensurePermission()
  if (!allowed) return

  await ensureChannel()

  // Annuler toutes les notifs précédentes pour repartir propre
  const { notifications: pending } = await LocalNotifications.getPending()
  if (pending.length > 0) {
    await LocalNotifications.cancel({ notifications: pending })
  }

  const now = Date.now()
  const toSchedule = []
  let notifId = 1000 // base ID pour les notifs commandes

  const enCours = commandes.filter(
    c => c.statut === 'en_cours' && c.date_livraison_prevue,
  )

  for (const commande of enCours) {
    const livraison = new Date(commande.date_livraison_prevue)
    livraison.setHours(8, 0, 0, 0) // notifier à 8h le jour J

    const msParJour = 86_400_000
    const j2 = new Date(livraison.getTime() - 2 * msParJour)
    j2.setHours(8, 0, 0, 0)

    const clientNom = commande.client?.nom ?? commande.client_nom ?? 'Client'
    const label = commande.description ?? `Commande #${commande.id}`

    // Alerte J-2 (si la date est encore dans le futur)
    if (j2.getTime() > now) {
      toSchedule.push({
        id:        notifId++,
        channelId: CHANNEL_ID,
        title:     `Livraison dans 2 jours — ${clientNom}`,
        body:      `${label} doit être prête le ${livraison.toLocaleDateString('fr-FR')}.`,
        schedule:  { at: j2, allowWhileIdle: true },
        extra:     { commande_id: commande.id },
      })
    }

    // Alerte retard (jour J, à 8h, si pas encore livré)
    if (livraison.getTime() > now) {
      toSchedule.push({
        id:        notifId++,
        channelId: CHANNEL_ID,
        title:     `Livraison aujourd'hui — ${clientNom}`,
        body:      `${label} est attendue aujourd'hui chez ${atelierNom}.`,
        schedule:  { at: livraison, allowWhileIdle: true },
        extra:     { commande_id: commande.id },
      })
    } else {
      // Déjà en retard — notifier immédiatement une seule fois par jour
      const todayKey = `notif_retard_${commande.id}_${new Date().toDateString()}`
      if (!localStorage.getItem(todayKey)) {
        toSchedule.push({
          id:        notifId++,
          channelId: CHANNEL_ID,
          title:     `Commande en retard — ${clientNom}`,
          body:      `${label} devait être livrée le ${livraison.toLocaleDateString('fr-FR')}.`,
          schedule:  { at: new Date(now + 5_000), allowWhileIdle: true },
          extra:     { commande_id: commande.id },
        })
        localStorage.setItem(todayKey, '1')
      }
    }
  }

  if (toSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: toSchedule })
  }
}
