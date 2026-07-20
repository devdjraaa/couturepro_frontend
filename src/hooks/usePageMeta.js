import { useEffect } from 'react'

const DEFAULT_TITLE = 'Gextimo — La marketplace des créateurs de mode africains'
const DEFAULT_DESC  = 'Trouvez les meilleurs designers et tailleurs africains. Commandez des tenues sur mesure, suivez vos commandes en temps réel.'
// Domaine courant (zéro hardcode) : fonctionne quel que soit le sous-domaine de déploiement.
const ORIGIN        = typeof window !== 'undefined' ? window.location.origin : ''
const DEFAULT_IMAGE = `${ORIGIN}/og-cover.png`
const BASE_URL      = ORIGIN

function setMeta(property, content) {
  if (!content) return
  let el = document.querySelector(`meta[property="${property}"]`) ?? document.querySelector(`meta[name="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, image, path, type = 'website', noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Gextimo` : DEFAULT_TITLE
    // Pages privées (VASAT, outils internes) : interdites d'indexation.
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')
    const desc      = description ?? DEFAULT_DESC
    const img       = image ?? DEFAULT_IMAGE
    const url       = path ? `${BASE_URL}${path}` : BASE_URL

    document.title = fullTitle
    setMeta('og:type',        type)
    setMeta('og:title',       fullTitle)
    setMeta('og:description', desc)
    setMeta('og:image',       img)
    setMeta('og:url',         url)
    setMeta('twitter:title',       fullTitle)
    setMeta('twitter:description', desc)
    setMeta('twitter:image',       img)
    setMeta('twitter:url',         url)
    setMeta('description',    desc)

    return () => { document.title = DEFAULT_TITLE }
  }, [title, description, image, path, type])
}
