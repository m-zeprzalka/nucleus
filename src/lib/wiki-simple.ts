// UPROSZCZONA WERSJA API - TYLKO TO CO DZIAŁA

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
const actionBase = (lang: string) => `https://${lang}.wikipedia.org/w/api.php`

type Summary = {
  title: string
  description?: string
  extract: string
  thumbnail?: { source: string }
  originalimage?: { source: string }
}

// KATEGORIE KTÓRE DZIAŁAJĄ DOBRZE - ROZSZERZONA LISTA
const WORKING_CATEGORIES = [
  "Kategoria:Historia",
  "Kategoria:Technologia",
  "Kategoria:Biologia",
  "Kategoria:Fizyka",
  "Kategoria:Kultura",
  "Kategoria:Astronomia",
  "Kategoria:Medycyna",
  "Kategoria:Sztuka",
  "Kategoria:Chemia",
  "Kategoria:Geografia",
  "Kategoria:Muzyka",
  "Kategoria:Film",
  "Kategoria:Literatura",
  "Kategoria:Sport",
  "Kategoria:Architektura",
]

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    ...init,
  })
  if (!res.ok) throw new Error(`Wiki error: ${res.status}`)
  return res.json() as Promise<T>
}

// PROSTA FUNKCJA MIESZANIA
function simpleRandomize<T>(arr: T[], seed: number): T[] {
  const result = arr.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
    seed = (seed * 1103515245 + 12345) % (1 << 31)
  }
  return result
}

function sanitizeExtract(text: string, max = 400): string {
  const clean = text.replace(/\s+/g, " ").trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean
}

// POBIERANIE KATEGORII I ARTYKUŁÓW
type CategoriesResponse = {
  query?: { pages?: Record<string, { categories?: { title: string }[] }> }
}

async function fetchCategoriesByTitles(
  lang: string,
  titles: string[]
): Promise<Map<string, string[]>> {
  if (!titles.length) return new Map()
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "categories",
    cllimit: "max",
    titles: titles.join("|"),
  })
  const data = await fetchJSON<CategoriesResponse>(
    `${actionBase(lang)}?${params.toString()}`
  )
  const map = new Map<string, string[]>()
  const pages = data.query?.pages || {}
  for (const pageId in pages) {
    const page = pages[pageId]
    if (page.categories) {
      const cats = page.categories
        .map((c) =>
          c.title.replace(/^Kategoria:/, "").replace(/^Category:/, "")
        )
        .filter((c) => c.length < 30)
        .slice(0, 3) // Max 3 kategorie
      map.set(titles.find((t) => t === (page as { title: string }).title)!, cats)
    }
  }
  return map
}

type PageImagesResponse = {
  query?: {
    pages?: Record<
      string,
      {
        title?: string
        thumbnail?: { source: string }
        original?: { source: string }
      }
    >
  }
}

async function fetchPageImagesByTitles(
  lang: string,
  titles: string[],
  thumbSize = 800
): Promise<Map<string, string>> {
  if (!titles.length) return new Map()
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "pageimages",
    piprop: "thumbnail|original",
    pithumbsize: String(thumbSize),
    titles: titles.join("|"),
  })
  const url = `${actionBase(lang)}?${params.toString()}`
  const data = await fetchJSON<PageImagesResponse>(url)
  const map = new Map<string, string>()
  const pages = data.query?.pages || {}
  for (const k in pages) {
    const p = pages[k]
    const t = p.title || ""
    const src = p.original?.source || p.thumbnail?.source
    if (t && src) map.set(t, src)
  }
  return map
}

async function fetchCategoryTitlesPage(
  lang: string,
  category: string,
  limit: number,
  cursor?: string
): Promise<{ titles: string[]; nextCursor?: string }> {
  const params = new URLSearchParams({
    action: "query",
    list: "categorymembers",
    format: "json",
    origin: "*",
    cmtitle: category,
    cmtype: "page",
    cmnamespace: "0",
    cmprop: "title",
    cmlimit: String(Math.min(Math.max(limit, 1), 50)),
  })
  if (cursor) params.set("cmcontinue", cursor)
  const url = `${actionBase(lang)}?${params.toString()}`
  const data = await fetchJSON<{
    query?: { categorymembers?: { title: string }[] }
    continue?: { cmcontinue?: string }
  }>(url)
  const rawTitles = (data.query?.categorymembers || []).map((m) => m.title)

  // Filtruj niechciane strony
  const badPrefixes = [
    "Portal:",
    "Wikiprojekt:",
    "Wikipedia:",
    "Kategoria:",
    "Category:",
    "Pomoc:",
    "Help:",
    "Plik:",
    "File:",
    "Szablon:",
    "Template:",
  ]
  const titles = rawTitles.filter(
    (t) => !badPrefixes.some((p) => t.startsWith(p))
  )

  return { titles, nextCursor: data.continue?.cmcontinue }
}

async function fetchSummariesByTitles(
  lang: string,
  titles: string[]
): Promise<FeedItem[]> {
  if (!titles.length) return []

  const summaryUrls = titles.map(
    (t) =>
      `${restBase(lang)}/page/summary/${encodeURIComponent(t)}?redirect=true`
  )

  const [summaryResults, categoriesMap] = await Promise.all([
    Promise.allSettled(summaryUrls.map((u) => fetchJSON<Summary>(u))),
    fetchCategoriesByTitles(lang, titles),
  ])

  const summaries = summaryResults
    .filter(
      (r): r is PromiseFulfilledResult<Summary> => r.status === "fulfilled"
    )
    .map((r) => r.value)

  if (!summaries.length) return []

  const items: FeedItem[] = summaries.map((s) => ({
    title: s.title,
    extract: sanitizeExtract(s.extract),
    source: "pl.wikipedia.org",
    image: s.originalimage?.source || s.thumbnail?.source,
    categories: categoriesMap.get(s.title) || [],
  }))

  // Dodaj obrazki dla tych bez obrazków
  const missingImages = items.filter((i) => !i.image).map((i) => i.title)
  if (missingImages.length) {
    const imgMap = await fetchPageImagesByTitles(lang, missingImages)
    for (const it of items) {
      if (!it.image) {
        it.image = imgMap.get(it.title)
      }
    }
  }

  // Tylko artykuły z obrazkami i dobrą treścią - łagodniejsze filtry
  return items.filter(
    (item) =>
      item.image &&
      item.extract.length > 30 && // Skrócone z 50 na 30
      !item.title.toLowerCase().includes("lista") &&
      !item.title.toLowerCase().includes("kategoria") &&
      !item.title.toLowerCase().includes("szablon") &&
      !item.extract.toLowerCase().includes("może odnosić się do") // Ujednoznacznienia
  )
}

// GŁÓWNA FUNKCJA - ULEPSZONA WERSJA
export async function fetchSimpleFeedItems(
  lang = "pl",
  count = 10,
  offset = 0
): Promise<PageResult> {
  const seed = Math.floor(Date.now() / (1000 * 60 * 5)) + offset // Zmienia się co 5 minut
  const categories = simpleRandomize(WORKING_CATEGORIES, seed)

  let allItems: FeedItem[] = []
  let attempts = 0
  const maxAttempts = Math.min(6, categories.length) // Więcej prób

  // Pobierz z kilku kategorii na raz dla większej różnorodności
  while (allItems.length < count * 1.5 && attempts < maxAttempts) {
    const category = categories[attempts % categories.length]

    try {
      const { titles } = await fetchCategoryTitlesPage(lang, category, 30) // Więcej tytułów
      if (titles.length > 0) {
        const randomTitles = simpleRandomize(titles, seed + attempts).slice(
          0,
          15
        )
        const items = await fetchSummariesByTitles(lang, randomTitles)
        allItems = allItems.concat(items)

        // Debug log
        console.log(
          `Category ${category}: got ${items.length} items with images`
        )
      }
    } catch (error) {
      console.error(`Error with category ${category}:`, error)
    }

    attempts++
  }

  // Usuń duplikaty
  const uniqueItems = Array.from(
    new Map(allItems.map((item) => [item.title, item])).values()
  )

  // Finalne mieszanie
  const shuffledItems = simpleRandomize(uniqueItems, seed + 9999)
  const resultItems = shuffledItems.slice(0, count)

  console.log(
    `Final result: ${resultItems.length} items from ${uniqueItems.length} unique items`
  )

  return {
    items: resultItems,
    nextCursor: uniqueItems.length > count ? String(offset + count) : undefined,
  }
}
