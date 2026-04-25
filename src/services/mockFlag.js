// Flag mode démo — contrôlé uniquement par atelier.is_demo depuis le backend
// Activable/désactivable depuis le panel admin ou l'app Capacitor
// Aucune variable d'environnement — jamais de config statique à la main
const state = { active: false }

export const setDemoMode = (v) => { state.active = Boolean(v) }
export const isMock = () => state.active
