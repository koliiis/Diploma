import { useCallback, useEffect, useState } from 'react'

type Options<T> = {
  loadCache: () => T[]
  saveCache: (data: T[]) => void
  fetch: () => Promise<T[]>
  fetchErrorMessage: string
}

export function useCachedListFetch<T>({
  loadCache,
  saveCache,
  fetch: fetchList,
  fetchErrorMessage,
}: Options<T>) {
  const [data, setData] = useState<T[]>(() => loadCache())
  const [isLoading, setIsLoading] = useState(() => loadCache().length === 0)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    const next = await fetchList()
    setData(next)
    saveCache(next)
  }, [fetchList, saveCache])

  useEffect(() => {
    const cachedAtRun = loadCache()

    async function run() {
      try {
        const fresh = await fetchList()
        setData(fresh)
        saveCache(fresh)
        setError(null)
      } catch {
        if (cachedAtRun.length === 0) {
          setError(fetchErrorMessage)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [fetchList, loadCache, saveCache, fetchErrorMessage])

  return { data, setData, isLoading, error, refetch }
}
