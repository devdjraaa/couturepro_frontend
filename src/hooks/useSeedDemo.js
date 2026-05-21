import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isMock } from '@/services/mockFlag'
import { seedDemo } from '@/services/demoSeeder'

export function useSeedDemo() {
  const queryClient = useQueryClient()
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const seed = async () => {
    if (!isMock()) return
    setLoading(true)
    seedDemo()
    await queryClient.invalidateQueries()
    setLoading(false)
    setDone(true)
  }

  return { seed, loading, done, available: isMock() }
}
