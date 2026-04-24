import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getTheme as getStoredTheme, setTheme as storeTheme } from '@/utils/storage'

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
