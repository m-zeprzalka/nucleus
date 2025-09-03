"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Header } from "@/components/Header"
import { Tags } from "@/components/Tags"
import type { FeedItem } from "@/lib/wiki-ultra-simple"
import { CardFeedFinal } from "@/components/CardGemini"

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Deduplicate helper
  const dedupeItems = (
    newItems: FeedItem[],
    existingItems: FeedItem[] = []
  ) => {
    const seen = new Set(existingItems.map((item) => item.title))
    return newItems.filter((item) => {
      if (seen.has(item.title)) return false
      seen.add(item.title)
      return true
    })
  }

  // Simple fetch function
  const fetchPage = useCallback(async (currentOffset = 0) => {
    console.log(`Fetching offset ${currentOffset}`)

    const params = new URLSearchParams({
      count: "8",
      offset: String(currentOffset),
    })

    const res = await fetch(`/api/wiki?${params.toString()}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    console.log(`Got ${data.items?.length || 0} items`)

    return data as { items: FeedItem[]; nextCursor?: string }
  }, [])

  // Initial load
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPage(0)
        setItems(data.items || [])
        setOffset(data.items?.length || 0)
        setHasMore(!!data.nextCursor)
      } catch (err) {
        setError("Nie udało się załadować artykułów")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchPage])

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true)
          fetchPage(offset)
            .then((data) => {
              const newItems = dedupeItems(data.items || [], items)
              setItems((prev) => [...prev, ...newItems])
              setOffset((prev) => prev + (data.items?.length || 0))
              setHasMore(!!data.nextCursor)
            })
            .catch(console.error)
            .finally(() => setLoadingMore(false))
        }
      },
      { rootMargin: "100px" }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [offset, loadingMore, hasMore, fetchPage, items.length])

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-4">
        <Tags />

        <div className="grid gap-6 mt-4">
          {loading && items.length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary mb-3" />
              <p className="text-sm text-muted-foreground">Ładowanie…</p>
            </div>
          )}

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {items.map((item, index) => (
            <CardFeedFinal
              key={`${item.title}-${index}`}
              title={item.title}
              extract={item.extract}
              categories={item.categories}
              relatedTopics={item.relatedTopics}
              source={item.source}
              image={item.image}
            />
          ))}

          <div ref={sentinelRef} />

          {loadingMore && (
            <div className="text-center py-4">
              <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          )}

          {!hasMore && items.length > 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Koniec listy
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
