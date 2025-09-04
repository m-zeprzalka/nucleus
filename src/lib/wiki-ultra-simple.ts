export type FeedItem = {
  title: string
  extract: string
  categories: string[]
  relatedTopics?: { title: string; pageid: number }[]
  source: string
  image?: string
}

export type PageResult = {
  items: FeedItem[]
  nextCursor?: string
}

// Cache najpopularniejszych artykułów
let popularArticles: string[] = []
let cacheTime = 0

// Konfiguracja agregacji
const AGGREGATION_DAYS = 90 // 90 dni (3 miesiące) - optymalne dla wydajności i jakości
const CACHE_DURATION = 1800000 // 30 minut cache (dłużej bo więcej danych)
const TOP_ARTICLES_LIMIT = 1000 // Zwiększamy limit do 1000

export async function fetchPopularArticles(
  lang = "pl",
  count = 8,
  offset = 0
): Promise<PageResult> {
  try {
    // Pobierz najpopularniejsze artykuły według odwiedzin w całej dostępnej historii (agregat z ostatnich 90 dni)
    if (
      popularArticles.length === 0 ||
      Date.now() - cacheTime > CACHE_DURATION
    ) {
      const articlesViews: { [key: string]: number } = {}

      // Smart sampling: pobierz co 3 dni z ostatnich 90 dni (30 próbek = 3 miesiące reprezentatywne)
      const promises = []
      for (let i = 1; i <= AGGREGATION_DAYS; i += 3) {
        // Co 3 dni zamiast każdy dzień
        const date = new Date()
        date.setDate(date.getDate() - i)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")

        promises.push(
          fetch(
            `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia.org/all-access/${year}/${month}/${day}`
          )
            .then((res) => res.json())
            .catch(() => null)
        )
      }

      const results = await Promise.all(promises)

      // Agreguj wyniki - sumuj odwiedziny każdego artykułu
      results.forEach((data) => {
        if (data?.items?.[0]?.articles) {
          data.items[0].articles.forEach(
            (article: { article: string; views: number }) => {
              if (
                !article.article.includes(":") &&
                article.article !== "Wikipedia:Strona_główna" &&
                article.article !== "Specjalna:Szukaj"
              ) {
                articlesViews[article.article] =
                  (articlesViews[article.article] || 0) + article.views
              }
            }
          )
        }
      })

      // Sortuj według łącznej liczby odwiedzin i weź top 1000 (zwiększony limit)
      popularArticles = Object.entries(articlesViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, TOP_ARTICLES_LIMIT)
        .map(([title]) => title)

      cacheTime = Date.now()
    }

    // Dla nieskończonego scrollu - losuj różne artykuły za każdym razem
    const shuffled = [...popularArticles].sort(() => Math.random() - 0.5)
    const selectedTitles = shuffled.slice(0, count)

    // Pobierz szczegóły artykułów
    const items = await Promise.all(
      selectedTitles.map(async (title: string) => {
        try {
          // Pobierz podstawowe info z Summary API
          const summaryResponse = await fetch(
            `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              title
            )}`
          )
          const summary = await summaryResponse.json()

          // Pobierz kategorie z MediaWiki API
          const categoriesResponse = await fetch(
            `https://${lang}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
              title
            )}&prop=categories&cllimit=5&format=json&origin=*`
          )
          const categoriesData = await categoriesResponse.json()
          const pages = categoriesData.query?.pages
          const pageId = Object.keys(pages || {})[0]
          const categories = pages?.[pageId]?.categories
            ?.map((cat: { title: string }) =>
              cat.title.replace("Kategoria:", "")
            )
            ?.slice(0, 3) || ["Historia", "Kultura"]

          return {
            title: summary.title || title,
            extract: (summary.extract || "").slice(0, 300),
            categories: categories,
            source: `${lang}.wikipedia.org`,
            image: summary.thumbnail?.source,
          }
        } catch {
          return null
        }
      })
    )

    return {
      items: items.filter(Boolean) as FeedItem[],
      nextCursor: String(offset + count), // Zawsze więcej dostępne dla infinity scroll
    }
  } catch {
    return { items: [], nextCursor: undefined }
  }
}
