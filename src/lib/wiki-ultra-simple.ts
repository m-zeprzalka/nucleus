// NOWA WERSJA - HIPERINTERESUJĄCE LOSOWE ARTYKUŁY Z CAŁEJ HISTORII WIKIPEDII

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

const restBase = (lang: string) => `https://${lang}.wikipedia.org/api/rest_v1`
const apiBase = (lang: string) => `https://${lang}.wikipedia.org/w/api.php`

type Summary = {
  title: string
  extract: string
  thumbnail?: { source: string }
  originalimage?: { source: string }
}

type CategoriesResponse = {
  query: {
    pages: {
      [key: string]: {
        categories?: Array<{
          title: string
        }>
      }
    }
  }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function cleanText(text: string): string {
  return (
    text.replace(/\s+/g, " ").trim().slice(0, 350) +
    (text.length > 350 ? "…" : "")
  )
}

function cleanCategoryName(category: string): string {
  return category.replace("Kategoria:", "").trim()
}

// NOWA FUNKCJA - NAJPOPULARNIEJSZE ARTYKUŁY W CAŁEJ HISTORII WIKIPEDII (BEZ OGRANICZEŃ CZASOWYCH)
async function fetchRandomHistoricalArticles(
  lang = "pl",
  limit = 50
): Promise<string[]> {
  try {
    console.log(
      `Fetching top ${limit} historically important articles from all time`
    )

    // Pobierz najpopularniejsze artykuły w całej historii (mierzone linkami - najlepszy wskaźnik ważności)
    const url = `${apiBase(
      lang
    )}?action=query&list=querypage&qppage=Mostlinked&qplimit=${
      limit * 3
    }&format=json`
    console.log(`Fetching from: ${url}`)

    const response = await fetchJSON<{
      query?: {
        querypage?: {
          results?: Array<{ ns: number; title: string }>
        }
      }
    }>(url)
    const results = response.query?.querypage?.results || []

    // Filtruj tylko rzeczywiste artykuły (namespace 0) i zwróć tytuły
    const historicallyImportant = results
      .filter((result) => result.ns === 0 && isRealArticle(result.title))
      .map((result) => result.title)
      .slice(0, limit * 2) // Więcej niż potrzeba żeby mieć z czego losować

    console.log(
      `Found ${historicallyImportant.length} historically important articles`
    )
    console.log(`Top 10: ${historicallyImportant.slice(0, 10).join(", ")}`)

    // LOSOWY WYBÓR z historycznie najważniejszych artykułów
    const shuffled = [...historicallyImportant].sort(() => Math.random() - 0.5)

    return shuffled.slice(0, limit)
  } catch (error) {
    console.error("Failed to fetch historical articles:", error)
    // Fallback do RZECZYWIŚCIE ważnych artykułów w historii
    return [
      "Polska",
      "Państwo",
      "Ziemia",
      "Stany_Zjednoczone",
      "Francja",
      "Niemcy",
      "Człowiek",
      "Europa",
      "Wojna",
      "Historia",
      "Język",
      "Kultura",
      "Religia",
      "Nauka",
      "Sztuka",
      "Muzyka",
      "Literatura",
      "Filozofia",
      "Matematyka",
      "Fizyka",
      "Chemia",
      "Biologia",
    ]
  }
}

// FILTROWANIE RZECZYWISTYCH ARTYKUŁÓW (UPROSZCZONE)
function isRealArticle(articleName: string): boolean {
  return (
    !articleName.startsWith("Wikipedia:") &&
    !articleName.startsWith("Specjalna:") &&
    !articleName.startsWith("Plik:") &&
    !articleName.startsWith("Kategoria:") &&
    !articleName.startsWith("Szablon:") &&
    !articleName.includes("Zmarli_w_") &&
    !articleName.includes("Urodzeni_w_") &&
    articleName !== "Strona_główna" &&
    articleName.length > 2 // Minimum 3 znaki
  )
}

// POBIERZ KATEGORIE DLA ARTYKUŁU
async function fetchArticleCategories(
  title: string,
  lang = "pl"
): Promise<string[]> {
  try {
    const url = `${apiBase(
      lang
    )}?action=query&prop=categories&titles=${encodeURIComponent(
      title
    )}&format=json&clshow=!hidden&cllimit=10`
    const response = await fetchJSON<CategoriesResponse>(url)

    const pages = response.query.pages
    const pageId = Object.keys(pages)[0]
    const categories = pages[pageId]?.categories || []

    return categories
      .map((cat) => cleanCategoryName(cat.title))
      .filter(
        (cat) =>
          !cat.includes("Artykuły") &&
          !cat.includes("Szablon") &&
          !cat.includes("Wikipedia") &&
          cat.length > 0
      )
      .slice(0, 5)
  } catch (error) {
    console.error(`Failed to fetch categories for ${title}:`, error)
    return []
  }
}

// GŁÓWNA FUNKCJA - HIPERINTERESUJĄCE LOSOWE ARTYKUŁY Z NAJWAŻNIEJSZYCH W CAŁEJ HISTORII
export async function fetchPopularArticles(
  lang = "pl",
  count = 8,
  offset = 0
): Promise<PageResult> {
  console.log(
    `Fetching ${count} all-time most important articles starting from offset ${offset}`
  )

  try {
    // Pobierz NAJWAŻNIEJSZE artykuły w całej historii Wikipedii (bez ograniczeń czasowych)
    const allTimeImportant = await fetchRandomHistoricalArticles(
      lang,
      count * 6
    ) // Więcej żeby mieć wybór

    // Weź artykuły z danego offsetu (losowość już zastosowana w fetchRandomHistoricalArticles)
    const articlesToFetch = allTimeImportant.slice(offset, offset + count)
    const items: FeedItem[] = []

    console.log(
      `All-time important articles to fetch: ${articlesToFetch.join(", ")}`
    )

    for (const title of articlesToFetch) {
      try {
        console.log(`Fetching: ${title}`)

        // Pobierz dane artykułu i kategorie równolegle
        const [summary, categories] = await Promise.all([
          fetchJSON<Summary>(
            `${restBase(lang)}/page/summary/${encodeURIComponent(title)}`
          ),
          fetchArticleCategories(title, lang),
        ])

        if (summary.extract && summary.extract.length > 50) {
          // Tylko artykuły z treścią
          items.push({
            title: summary.title,
            extract: cleanText(summary.extract),
            categories: categories,
            source: "pl.wikipedia.org",
            image:
              summary.originalimage?.source || summary.thumbnail?.source || "",
          })
          console.log(`✓ ${title} - OK (${categories.length} categories)`)
        }
      } catch (error) {
        console.log(`✗ ${title} - FAILED:`, error)
      }
    }

    console.log(
      `Successfully fetched ${items.length} all-time important articles`
    )

    return {
      items,
      nextCursor: String(offset + count),
    }
  } catch (error) {
    console.error("Error in fetchPopularArticles:", error)
    return { items: [], nextCursor: undefined }
  }
}
