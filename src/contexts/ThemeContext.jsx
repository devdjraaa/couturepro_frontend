import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { getTheme as getStoredTheme, setTheme as storeTheme } from '@/utils/storage'

async function applyStatusBar(isDark) {
  if (!Capacitor.isNativePlatform()) return
  try {
    // Le WebView reste sous la status bar (pas d'edge-to-edge overlay) : évite que le header
    // passe sous « le rideau » du téléphone. NB : sur Android 15 (edge-to-edge forcé), la
    // vraie solution est le plugin @capacitor-community/safe-area (cf. journal — décision safe-area).
    await StatusBar.setOverlaysWebView({ overlay: false })
    // Fond de status bar toujours foncé (rouge en clair, navy en sombre) → icônes claires.
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: isDark ? '#0f172a' : '#e11d2a' })
  } catch { /* ignore sur émulateur/web sans status bar native */ }
}

const ThemeContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme) {
  const resolved = resolveTheme(theme)
  document.documentElement.setAttribute('data-theme', resolved)
  applyStatusBar()
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getStoredTheme())

  // Appliquer le thème au montage + écouter les changements système
  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t) => {
    storeTheme(t)
    setThemeState(t)
    applyTheme(t)
  }, [])

  // Cycle : clair → sombre → système → clair
  const toggleTheme = useCallback(() => {
    setTheme(
      theme === 'light' ? 'dark'
      : theme === 'dark' ? 'system'
      : 'light'
    )
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme: resolveTheme(theme),
      setTheme,
      toggleTheme,
      isDark: resolveTheme(theme) === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être utilisé à l\'intérieur de ThemeProvider')
  return ctx
}
