import adminApi from '../adminApi'

/**
 * Réglages vitrine pilotés par la direction, sans redéploiement.
 *
 * Ces deux jeux de valeurs vivaient côté serveur SANS écran pour les lire :
 * l'identité légale n'avait qu'un PUT, les périodes saisonnières aussi. On
 * pouvait donc écraser à l'aveugle, jamais consulter. Les lectures ont été
 * ajoutées en même temps que cet écran.
 */
export const reglagesVitrineAdminService = {
  async getSplashThemes() {
    const { data } = await adminApi.get('/vitrine/splash-themes')
    return data?.themes ?? []
  },

  async setSplashThemes(themes) {
    const { data } = await adminApi.put('/vitrine/splash-themes', { themes })
    return data
  },

  async getIdentiteLegale() {
    const { data } = await adminApi.get('/vitrine/identite-legale')
    return data
  },

  async setIdentiteLegale(payload) {
    const { data } = await adminApi.put('/vitrine/identite-legale', payload)
    return data
  },

  async getModerationAvis() {
    const { data } = await adminApi.get('/vitrine/moderation-avis')
    return data?.reglages ?? {}
  },

  async setModerationAvis(payload) {
    const { data } = await adminApi.put('/vitrine/moderation-avis', payload)
    return data?.reglages ?? {}
  },
}
