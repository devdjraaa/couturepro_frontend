import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const isNative = () => Capacitor.isNativePlatform()

/**
 * Lit une valeur de façon sécurisée.
 * Native : Preferences (chiffré par le système Android Keystore).
 * Web    : localStorage.
 */
export async function secureGet(key) {
  if (!isNative()) return localStorage.getItem(key)
  const { value } = await Preferences.get({ key })
  return value
}

/**
 * Écrit une valeur de façon sécurisée.
 * Sur natif, écrit dans Preferences ET dans localStorage (cache sync pour l'intercepteur axios).
 */
export async function secureSet(key, value) {
  localStorage.setItem(key, value)           // cache sync toujours à jour
  if (!isNative()) return
  await Preferences.set({ key, value })
}

/**
 * Supprime une valeur.
 */
export async function secureRemove(key) {
  localStorage.removeItem(key)
  if (!isNative()) return
  await Preferences.remove({ key })
}

/**
 * Efface toutes les entrées (déconnexion).
 */
export async function secureClearAll(keys) {
  keys.forEach(k => localStorage.removeItem(k))
  if (!isNative()) return
  await Promise.all(keys.map(k => Preferences.remove({ key: k })))
}
