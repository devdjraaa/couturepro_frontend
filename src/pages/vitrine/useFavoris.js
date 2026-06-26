import { useState, useEffect } from 'react'

// Favoris visiteur — stockés en localStorage (sans compte). Liste d'ids de créateurs.
const KEY = 'gx_favoris'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export function useFavoris() {
  const [ids, setIds] = useState(read)

  useEffect(() => {
    const h = () => setIds(read())
    window.addEventListener('gx-favoris', h)
    return () => window.removeEventListener('gx-favoris', h)
  }, [])

  const toggle = (id) => {
    const cur = read()
    const sid = String(id)
    const next = cur.includes(sid) ? cur.filter((x) => x !== sid) : [...cur, sid]
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* indisponible */ }
    window.dispatchEvent(new Event('gx-favoris'))
  }

  return { ids, has: (id) => ids.includes(String(id)), toggle }
}
