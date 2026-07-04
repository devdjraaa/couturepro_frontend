import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { getTheme as getStoredTheme, setTheme as storeTheme } from '@/utils/storage'

async function applyStatusBar(isDark) {
  if (!Capacitor.isNativePlatform()) return
  try {
    // Edge-to-edge : la status bar se superpose au contenu ; le décalage est géré par la safe-area
    // (viewport-fit=cover + .pt-safe + plugin @capacitor-community/safe-area).
    // Icônes adaptées au thème : foncées sur fond clair (pages d'auth), claires en mode sombre.
    await StatusBar.setOverlaysWebView({ overlay: true })
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
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
  applyStatusBar(resolved === 'dark')
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
