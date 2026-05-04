import { useState, useEffect } from 'react'
import { Q } from '@nozbe/watermelondb'
import database from './database'

/**
 * Observe une query WatermelonDB et retourne { data, isLoading }.
 * getQuery doit être stable (ou wrappé dans useMemo côté appelant).
 */
export function useWmQuery(getQuery, deps = []) {
  const [data, setData]         = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const query = getQuery()
    const sub = query.observe().subscribe(records => {
      setData(records)
      setIsLoading(false)
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, isLoading }
}

/**
 * Observe un seul enregistrement par ID.
 */
export function useWmRecord(tableName, id) {
  const [data, setData]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    setIsLoading(true)
    const sub = database.get(tableName)
      .findAndObserve(id)
      .subscribe(
        record => { setData(record); setIsLoading(false) },
        ()     => { setData(null);   setIsLoading(false) }, // not found / deleted
      )
    return () => sub.unsubscribe()
  }, [tableName, id])

  return { data, isLoading }
}

/**
 * Retourne une fonction utilitaire pour construire des hooks de mutation
 * compatible avec l'API TanStack Query (mutate, mutateAsync, isPending, error).
 */
export function useMutation(fn) {
  const [isPending, setIsPending] = useState(false)
  const [error,     setError]     = useState(null)

  const mutateAsync = async (variables) => {
    setIsPending(true)
    setError(null)
    try {
      const result = await fn(variables)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  const mutate = (variables, options = {}) => {
    mutateAsync(variables)
      .then(data => options.onSuccess?.(data))
      .catch(err => options.onError?.(err))
      .finally(() => options.onSettled?.())
  }

  return { mutate, mutateAsync, isPending, isLoading: isPending, error }
}

export { Q, database }
