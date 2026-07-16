// P150 — Connexion Google NATIVE (Credential Manager) via @capgo/capacitor-social-login.
// ⚠️ Fichier ANDROID-ONLY : ne jamais porter sur master (dépendance @capgo native).
// Le client ID web (audience de l'idToken) vient de l'API → rien de figé dans l'app.
import { SocialLogin } from '@capgo/capacitor-social-login'

let initialise = false

export async function googleNativeLogin(webClientId) {
  if (!initialise) {
    await SocialLogin.initialize({ google: { webClientId } })
    initialise = true
  }

  const res = await SocialLogin.login({ provider: 'google', options: {} })

  // Selon la version du plugin, l'idToken peut être à plusieurs endroits.
  const idToken =
    res?.result?.idToken ??
    res?.result?.authentication?.idToken ??
    res?.idToken ??
    null

  if (!idToken) throw new Error('idToken Google introuvable')
  return idToken
}
