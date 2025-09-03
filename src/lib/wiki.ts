// wiki.ts - WERSJA Z CIEKAWSZYMI TREŚCIAMI

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

// ... (funkcje pomocnicze, które już masz, bez zmian) ...
type Summary = {
  title: string
  description?: string
  extract: string
  thumbnail?: { source: string }
  originalimage?: { source: string }
}
const TAG_CATEGORY_MAP: Record<string, { pl: string; en: string }> = {
  Wszystkie: { pl: "", en: "" },
  Historia: { pl: "Kategoria:Historia", en: "Category:History" },
  Technologia: { pl: "Kategoria:Technologia", en: "Category:Technology" },
  Informatyka: { pl: "Kategoria:Informatyka", en: "Category:Computer_science" },
  Matematyka: { pl: "Kategoria:Matematyka", en: "Category:Mathematics" },
  Fizyka: { pl: "Kategoria:Fizyka", en: "Category:Physics" },
  Biologia: { pl: "Kategoria:Biologia", en: "Category:Biology" },
  Medycyna: { pl: "Kategoria:Medycyna", en: "Category:Medicine" },
  Kultura: { pl: "Kategoria:Kultura", en: "Category:Culture" },
  Kosmos: { pl: "Kategoria:Astronomia", en: "Category:Astronomy" },
  Ekologia: { pl: "Kategoria:Ekologia", en: "Category:Ecology" },
  Psychologia: { pl: "Kategoria:Psychologia", en: "Category:Psychology" },
  Sztuka: { pl: "Kategoria:Sztuka", en: "Category:Art" },
  Kulinaria: { pl: "Kategoria:Gastronomia", en: "Category:Gastronomy" },
}
function tagToCategory(lang: string, tag?: string): string | undefined {
  if (!tag) return undefined
  const key = tag.trim()
  const rec = TAG_CATEGORY_MAP[key]
  if (!rec) return undefined
  if (key === "Wszystkie") return undefined
  return lang.startsWith("pl") ? rec.pl : rec.en
}
const ALL_DOMAIN_TAGS_ORDER = [
  "Historia",
  "Technologia",
  "Informatyka",
  "Matematyka",
  "Fizyka",
  "Biologia",
  "Medycyna",
  "Kultura",
  "Kosmos",
  "Ekologia",
  "Psychologia",
  "Sztuka",
  "Kulinaria",
]
function getAllDomainCategories(lang: string): string[] {
  const isPL = lang.startsWith("pl")
  return ALL_DOMAIN_TAGS_ORDER.map(
    (tag) => TAG_CATEGORY_MAP[tag]?.[isPL ? "pl" : "en"]
  ).filter(Boolean) as string[]
}
async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    ...init,
  })
  if (!res.ok) throw new Error(`Wiki error: ${res.status}`)
  return res.json() as Promise<T>
}
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rnd = mulberry32(seed || 1)
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
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
      map.set(titles.find((t) => t === (page as { title: string }).title)!, cats)
    }
  }
  return map
}
type RelatedResponse = { pages?: { title: string; pageid: number }[] }
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
  const badPrefixes = [
    "Portal:",
    "Wikiprojekt:",
    "Wikipedia:",
    "Kategoria:",
    "Category:",
    "Pomoc:",
    "Help:",
  ]
  const titles = rawTitles.filter(
    (t) => !badPrefixes.some((p) => t.startsWith(p))
  )
  return { titles, nextCursor: data.continue?.cmcontinue }
}
function onlyWithImages(items: FeedItem[]): FeedItem[] {
  return items.filter((i) => Boolean(i.image))
}
function encodeAllCursor(
  i: number,
  c?: string,
  s?: number
): string | undefined {
  if (i < 0) return undefined
  const payload = { i, c, ...(typeof s === "number" && { s }) }
  return `all:${Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64"
  )}`
}

// =========================================================================
// TWOJE CENTRUM STEROWANIA (Poniżej znajdują się "dźwignie", którymi zarządzasz)
// =========================================================================

/**
 * DŹWIGNIA #1: Filtrowanie jakości i długość ekstraktu
 * Kontroluje jakość artykułów i długość tekstu na karcie
 */
function sanitizeExtract(text: string, max = 500): string {
  const clean = text.replace(/\s+/g, " ").trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean
}

function isHighQualityArticle(item: FeedItem): boolean {
  // Filtruj artykuły wysokiej jakości
  const title = item.title.toLowerCase()
  const extract = item.extract.toLowerCase()

  // Usuń artykuły o złej jakości
  const badKeywords = [
    "ujednoznacznienie",
    "disambiguation",
    "may refer to",
    "lista",
    "list of",
    "kategoria",
    "category",
    "szablon",
    "template",
    "redirect",
    "przekierowanie",
  ]

  if (
    badKeywords.some(
      (keyword) => title.includes(keyword) || extract.includes(keyword)
    )
  ) {
    return false
  }

  // Wymagaj minimum tekstu (artykuły zbyt krótkie to często stub-y)
  if (item.extract.length < 100) {
    return false
  }

  // Preferuj artykuły z kategoriami (bardziej rozwinięte)
  if (item.categories.length === 0) {
    return false
  }

  return true
}

/**
 * DŹWIGNIA #2: Ilość powiązanych tematów w popoverze
 * Zmieniając `slice(0, 3)`, decydujesz, ile linków do powiązanych artykułów pokazać.
 */
async function fetchRelatedByTitle(
  lang: string,
  title: string
): Promise<{ title: string; pageid: number }[] | undefined> {
  try {
    const url = `${restBase(lang)}/page/related/${encodeURIComponent(title)}`
    const data = await fetchJSON<RelatedResponse>(url)
    return data.pages?.slice(0, 3) // Zmień 3 na inną liczbę
  } catch {
    return undefined
  }
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
  const [summaryResults, categoriesMap, ...relatedResults] = await Promise.all([
    Promise.allSettled(summaryUrls.map((u) => fetchJSON<Summary>(u))),
    fetchCategoriesByTitles(lang, titles),
    ...titles.map((t) => fetchRelatedByTitle(lang, t)),
  ])
  const summaries = summaryResults
    .filter(
      (r): r is PromiseFulfilledResult<Summary> => r.status === "fulfilled"
    )
    .map((r) => r.value)
  if (!summaries.length) return []

  const items: FeedItem[] = summaries.map((s, index) => ({
    title: s.title,
    extract: sanitizeExtract(s.extract),
    source: "pl.wikipedia.org",
    image: s.originalimage?.source || s.thumbnail?.source,
    categories: categoriesMap.get(s.title) || [],
    relatedTopics: relatedResults[index] as
      | { title: string; pageid: number }[]
      | undefined,
  }))

  // Dodaj obrazki dla tych, które ich nie mają
  const missingImages = items.filter((i) => !i.image).map((i) => i.title)
  if (missingImages.length) {
    const imgMap = await fetchPageImagesByTitles(lang, missingImages)
    for (const it of items) {
      if (!it.image) {
        it.image = imgMap.get(it.title)
      }
    }
  }

  // NOWE: Filtruj tylko wysokiej jakości artykuły
  const highQualityItems = items.filter(isHighQualityArticle)

  return highQualityItems
}

/**
 * DŹWIGNIA #3: GŁÓWNA STRATEGIA POBIERANIA DANYCH
 * Pobiera NAJPOPULARNIEJSZE artykuły z różnych metod z większą niezawodnością
 */
type MostReadResponse = {
  articles?: Array<{ title: string; normalizedtitle?: string }>
}

type PageViewsResponse = {
  items?: Array<{
    articles?: Array<{ article: string; views: number }>
  }>
}

export async function fetchMostReadFeedItems(
  lang = "pl",
  count = 20,
  seed?: number
): Promise<PageResult> {
  // METODA 1: Najpopularniejsze artykuły z ostatnich dni (bardziej niezawodna)
  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - daysAgo)
    const yyyy = String(d.getUTCFullYear())
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
    const dd = String(d.getUTCDate()).padStart(2, "0")

    try {
      // Próbuj najpierw feed/most-read
      const mostReadUrl = `${restBase(lang)}/feed/most-read/${yyyy}/${mm}/${dd}`
      const data = await fetchJSON<MostReadResponse>(mostReadUrl)
      const articles = data.articles ?? []

      if (articles.length > 10) {
        const unwanted = [
          "Main_Page",
          "Strona_główna",
          "Specjalna:",
          "Special:",
          "Plik:",
          "File:",
        ]
        let titles = articles
          .map((a) => a.normalizedtitle || a.title)
          .filter((t) => !unwanted.some((u) => t.includes(u)))
          .slice(0, Math.min(count * 2, 40)) // Bierz więcej, bo część zostanie odfiltrowana

        if (seed) titles = seededShuffle(titles, seed)

        if (titles.length >= 5) {
          const items = await fetchSummariesByTitles(lang, titles)
          const withImg = onlyWithImages(items)
          if (withImg.length >= 3) return { items: withImg }
        }
      }
    } catch {
      // Kontynuuj z następnym dniem
    }
  }

  // METODA 2: Pageviews API (alternatywne źródło popularności)
  try {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, "")

    const pageviewsUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia/all-access/${dateStr}`
    const pvData = await fetchJSON<PageViewsResponse>(pageviewsUrl)
    const topArticles = pvData.items?.[0]?.articles ?? []

    if (topArticles.length > 10) {
      const unwanted = [
        "Main_Page",
        "Strona_główna",
        "Specjalna:",
        "Special:",
        "Plik:",
        "File:",
        "-",
      ]
      let titles = topArticles
        .map((a) => a.article)
        .filter((t) => !unwanted.some((u) => t.includes(u)))
        .filter((t) => t.length > 3 && !t.includes(":"))
        .slice(0, Math.min(count * 2, 30))
        .map((t) => decodeURIComponent(t).replace(/_/g, " "))

      if (seed) titles = seededShuffle(titles, seed)

      if (titles.length >= 5) {
        const items = await fetchSummariesByTitles(lang, titles)
        const withImg = onlyWithImages(items)
        if (withImg.length >= 3) return { items: withImg }
      }
    }
  } catch {
    // Kontynuuj do fallback
  }

  return { items: [] } // Zwróć puste, jeśli nic się nie uda
}

// Stare funkcje do pobierania po kategoriach (teraz jako fallback)
export async function fetchCategoryFeedItems(
  lang = "pl",
  category: string,
  count = 10,
  cursor?: string,
  seed?: number
): Promise<PageResult> {
  let attempts = 0,
    cur = cursor
  while (attempts < 5) {
    attempts++
    const { titles, nextCursor } = await fetchCategoryTitlesPage(
      lang,
      category,
      count,
      cur
    )
    if (titles.length) {
      const items = await fetchSummariesByTitles(lang, titles)
      let withImg = onlyWithImages(items)
      if (seed) withImg = seededShuffle(withImg, seed)
      if (withImg.length) return { items: withImg, nextCursor }
    }
    if (nextCursor) cur = nextCursor
    else break
  }
  return { items: [], nextCursor: cur }
}

export async function fetchTaggedFeedItems(
  lang = "pl",
  tag: string,
  count = 10,
  cursor?: string,
  seed?: number
): Promise<PageResult> {
  // Jeśli użytkownik kliknie tag (np. Historia), użyj starej, precyzyjnej metody
  const category = tagToCategory(lang, tag)
  if (!category) {
    // A jeśli tag to "Wszystkie", użyj nowej, ciekawej metody
    return fetchMostReadFeedItems(lang, count, seed)
  }
  return fetchCategoryFeedItems(lang, category, count, cursor, seed)
}

/**
 * DŹWIGNIA #4: ZACHOWANIE DOMYŚLNE I AWARYJNE + WIĘKSZA RÓŻNORODNOŚĆ
 * Teraz łączy popularne artykuły z różnorodnymi kategoriami dla lepszego miksu
 */
export async function fetchAllDomainsFeedItems(
  lang = "pl",
  count = 10,
  cursor?: string,
  seed?: number
): Promise<PageResult> {
  // Generuj nowy seed dla każdego wywołania, jeśli nie podano
  if (typeof seed !== "number") {
    seed = Math.floor(Date.now() % 2_147_483_647)
  }

  // NOWA STRATEGIA: Mieszaj popularne z różnorodnymi
  const halfCount = Math.ceil(count / 2)

  // Część 1: Popularne artykuły (50% wyników)
  const mostReadResult = await fetchMostReadFeedItems(lang, halfCount, seed)
  let items = mostReadResult.items || []

  // Część 2: Różnorodne z kategorii (pozostałe 50%)
  if (items.length < count) {
    const remaining = count - items.length
    const categoriesBase = getAllDomainCategories(lang)

    if (categoriesBase.length) {
      // Losuj kategorie z innym seedem dla większej różnorodności
      const categories = seededShuffle(categoriesBase, seed + 1000)

      // Pobierz po kilka artykułów z różnych kategorii
      const categoriesPerRound = Math.min(3, categories.length)
      const itemsPerCategory = Math.ceil(remaining / categoriesPerRound)

      for (let i = 0; i < categoriesPerRound && items.length < count; i++) {
        try {
          const cat = categories[i]
          const { titles } = await fetchCategoryTitlesPage(
            lang,
            cat,
            itemsPerCategory * 2, // Pobierz więcej bo część zostanie odfiltrowana
            undefined
          )

          if (titles.length) {
            const shuffledTitles = seededShuffle(titles, seed + i + 2000)
            const categoryItems = await fetchSummariesByTitles(
              lang,
              shuffledTitles.slice(0, itemsPerCategory)
            )
            const withImg = onlyWithImages(categoryItems)
            items = items.concat(withImg)
          }
        } catch {
          // Kontynuuj z następną kategorią
        }
      }
    }
  }

  // Finalne mieszanie wszystkich wyników
  if (items.length > 1) {
    items = seededShuffle(items, seed + 3000)
  }

  // Ogranicz do żądanej liczby
  const finalItems = items.slice(0, count)

  // Zwróć z kursorem dla kolejnej strony (używaj czasowy seed)
  const nextCursor =
    finalItems.length >= count
      ? encodeAllCursor(0, undefined, Date.now() % 2_147_483_647)
      : undefined

  return { items: finalItems, nextCursor }
}
