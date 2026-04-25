// Flag dynamique pour le mode démo/mock
// Initialisé depuis VITE_USE_MOCKS (dev local), puis ajusté à l'auth depuis atelier.is_demo
const state = {
  active: import.meta.env.VITE_USE_MOCKS === 'true',
}

export const setDemoMode = (v) => { state.active = Boolean(v) }
export const isMock = () => state.active
