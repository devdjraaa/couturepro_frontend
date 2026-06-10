import { useRef, useState, useEffect } from 'react'

const THRESHOLD = 68
const MAX_PULL  = THRESHOLD + 28

export function usePullToRefresh(onRefresh) {
  const containerRef  = useRef(null)
  const startY        = useRef(0)
  const pullYRef      = useRef(0)
  const refreshingRef = useRef(false)
  const callbackRef   = useRef(onRefresh)
  callbackRef.current = onRefresh

  const [pullY,     setPullY]     = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onTouchStart = e => {
      if (!callbackRef.current || el.scrollTop > 0) return
      startY.current = e.touches[0].clientY
    }

    const onTouchMove = e => {
      if (!callbackRef.current || !startY.current) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0) {
        e.preventDefault()
        const v = Math.min(delta * 0.5, MAX_PULL)
        pullYRef.current = v
        setPullY(v)
      }
    }

    const onTouchEnd = async () => {
      if (!startY.current) return
      const py = pullYRef.current
      startY.current = 0
      if (py >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true
        setRefreshing(true)
        pullYRef.current = THRESHOLD
        setPullY(THRESHOLD)
        try { await callbackRef.current?.() } finally {
          refreshingRef.current = false
          setRefreshing(false)
          pullYRef.current = 0
          setPullY(0)
        }
      } else {
        pullYRef.current = 0
        setPullY(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  return { containerRef, pullY, refreshing, threshold: THRESHOLD }
}
