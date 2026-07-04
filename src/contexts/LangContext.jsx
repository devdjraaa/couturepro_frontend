import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLang, setLang as storeLang, getToken } from '@/utils/storage'
import { parametresService } from '@/services/parametresService'

const LANGUES_DISPO = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  // Langues à réactiver une fois les fichiers de traduction ajoutés (src/lang/ + i18n.js) :
  // { code: 'ar', label: 'العربية',  flag: '🇲🇦' },
  // { code: 'wo', label: 'Wolof',    flag: '🇸🇳' },
]

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const { i18n } = useTranslation()
  const [langue, setLangueState] = useState(() => getLang())

  // #36 — Au démarrage, charger la langue depuis l'API (si connecté)
  useEffect(() => {
    i18n.changeLanguage(langue)
    if (!getToken()) return
    parametresService.getLangue()
      .then(({ langue: l }) => {
        if (l && l !== langue) {
          storeLang(l)
          setLangueState(l)
          i18n.changeLanguage(l)
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setLangue = useCallback((code) => {
    const FADE_OUT = 160
    const FADE_IN  = 220
    const body = document.body
    body.style.transition = `opacity ${FADE_OUT}ms ease, filter ${FADE_OUT}ms ease`
    body.style.opacity    = '0'
    body.style.filter     = 'blur(3px)'

    setTimeout(() => {
      storeLang(code)
      setLangueState(code)
      i18n.changeLanguage(code)
      // #36 — Persister en base
      parametresService.updateLangue(code).catch(() => {})

      requestAnimationFrame(() => {
        body.style.transition = `opacity ${FADE_IN}ms ease, filter ${FADE_IN}ms ease`
        body.style.opacity    = '1'
        body.style.filter     = 'blur(0px)'
        setTimeout(() => {
          body.style.transition = ''
          body.style.filter     = ''
        }, FADE_IN)
      })
    }, FADE_OUT)
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
