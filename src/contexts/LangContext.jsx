import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLang, setLang as storeLang } from '@/utils/storage'

const LANGUES_DISPO = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
]

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const { i18n } = useTranslation()
  const [langue, setLangueState] = useState(() => getLang())

  useEffect(() => {
    i18n.changeLanguage(langue)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setLangue = useCallback((code) => {
    storeLang(code)
    setLangueState(code)
    i18n.changeLanguage(code)
  }, [i18n])

  return (
    <LangContext.Provider value={{ langue, setLangue, languesDispo: LANGUES_DISPO }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang doit être utilisé à l\'intérieur de LangProvider')
  return ctx
}

// Hook raccourci — à importer dans les composants au lieu de useTranslation()
export function useT() {
  const { t } = useTranslation()
  return t
}
