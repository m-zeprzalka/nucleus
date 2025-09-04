# 📚 Nucleus - Wikipedia API Documentation

## 🎯 **Aktualny System - Najpopularniejsze Artykuły według Odwiedzin**

### **Opis architektury:**

Aplikacja Nucleus wykorzystuje **30-dniową agregację danych pageviews** z Wikipedia Analytics API, aby dostarczyć najpopularniejsze artykuły według rzeczywistych odwiedzin użytkowników.

---

## 🔧 **Struktura API**

### **Typy danych:**

```typescript
export type FeedItem = {
  title: string              // Tytuł artykułu
  extract: string            // Opis (max 300 znaków)
  categories: string[]       // Kategorie (max 3)
  relatedTopics?: {...}[]    // Powiązane tematy (nieużywane)
  source: string             // Źródło: "pl.wikipedia.org"
  image?: string             // URL miniaturki
}

export type PageResult = {
  items: FeedItem[]          // Lista artykułów
  nextCursor?: string        // Token dla infinity scroll
}
```

### **Główna funkcja:**

```typescript
fetchPopularArticles(lang = "pl", count = 8, offset = 0): Promise<PageResult>
```

---

## 📊 **Proces pobierania danych:**

### **1. Agregacja popularności (30 dni):**

```javascript
// Pobiera dane z ostatnich 30 dni
for (let i = 1; i <= 30; i++) {
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${lang}.wikipedia.org/all-access/${year}/${month}/${day}`
}

// Sumuje odwiedziny każdego artykułu
articlesViews[article.article] =
  (articlesViews[article.article] || 0) +
  article.views

    // Sortuje według łącznych odwiedzin
    .sort(([, a], [, b]) => b - a)
```

### **2. Pobieranie szczegółów artykułu:**

- **Summary API:** Podstawowe info + miniaturka
- **MediaWiki API:** Kategorie artykułu

### **3. Cache i optymalizacja:**

- **10 minut cache** dla listy popularnych
- **Randomizacja** dla różnorodności przy scrollingu
- **Parallel requests** dla wydajności

---

## 🌐 **Wykorzystywane API Wikipedii**

### **1. Wikipedia Analytics API (Pageviews)**

**URL:** `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/{project}/{access}/{year}/{month}/{day}`

**Przykład:**

```
https://wikimedia.org/api/rest_v1/metrics/pageviews/top/pl.wikipedia.org/all-access/2024/09/03
```

**Zwraca:**

```json
{
  "items": [
    {
      "project": "pl.wikipedia",
      "articles": [
        { "article": "Whitney_Houston", "views": 64749, "rank": 1 },
        { "article": "II_wojna_światowa", "views": 10822, "rank": 2 }
      ]
    }
  ]
}
```

### **2. Wikipedia REST API (Summary)**

**URL:** `https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`

**Przykład:**

```
https://pl.wikipedia.org/api/rest_v1/page/summary/Whitney_Houston
```

**Zwraca:**

```json
{
  "title": "Whitney Houston",
  "extract": "Whitney Elizabeth Houston...",
  "thumbnail": { "source": "https://upload.wikimedia.org/..." }
}
```

### **3. MediaWiki API (Categories)**

**URL:** `https://{lang}.wikipedia.org/w/api.php?action=query&titles={title}&prop=categories&format=json&origin=*`

**Zwraca:**

```json
{
  "query": {
    "pages": {
      "12345": {
        "categories": [{ "title": "Kategoria:Amerykańscy wokaliści" }]
      }
    }
  }
}
```

---

## 🎨 **Inne ciekawe możliwości Wikipedia API**

### **📈 Analytics & Metrics:**

#### **1. Edits Analytics**

```
https://wikimedia.org/api/rest_v1/metrics/edits/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}
```

- **Zastosowanie:** Liczba edycji w czasie
- **Parametry:** project, editor-type (all/user/bot), granularity (daily/monthly)

#### **2. Editors Analytics**

```
https://wikimedia.org/api/rest_v1/metrics/editors/aggregate/{project}/{editor-type}/{page-type}/{activity-level}/{granularity}/{start}/{end}
```

- **Zastosowanie:** Liczba aktywnych edytorów
- **Parametry:** activity-level (1-edit, 5-edits, 25-edits, 100-edits)

#### **3. Page Views per Country**

```
https://wikimedia.org/api/rest_v1/metrics/pageviews/top-by-country/{project}/{access}/{year}/{month}
```

- **Zastosowanie:** Najpopularniejsze artykuły według krajów

### **🔍 Search & Discovery:**

#### **4. OpenSearch**

```
https://pl.wikipedia.org/w/api.php?action=opensearch&search={query}&limit=10&format=json
```

- **Zastosowanie:** Autocomplete, sugestie wyszukiwania

#### **5. Advanced Search**

```
https://pl.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&format=json
```

- **Zastosowanie:** Pełnotekstowe wyszukiwanie artykułów

### **📰 Content APIs:**

#### **6. Random Articles**

```
https://pl.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=10&format=json
```

- **Zastosowanie:** Losowe artykuły

#### **7. Featured Content**

```
https://pl.wikipedia.org/api/rest_v1/feed/featured/{year}/{month}/{day}
```

- **Zastosowanie:** Artykuł dnia, obraz dnia

#### **8. Recent Changes**

```
https://pl.wikipedia.org/w/api.php?action=query&list=recentchanges&rclimit=50&format=json
```

- **Zastosowanie:** Ostatnie zmiany na Wikipedii

### **🗺️ Geographic APIs:**

#### **9. Nearby Articles**

```
https://pl.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lon}&gsradius=1000&format=json
```

- **Zastosowanie:** Artykuły w pobliżu lokalizacji

#### **10. Coordinates**

```
https://pl.wikipedia.org/w/api.php?action=query&prop=coordinates&titles={title}&format=json
```

- **Zastosowanie:** Współrzędne geograficzne artykułu

---

## 🚀 **Pomysły na rozszerzenia Nucleus:**

### **1. Trending Topics**

```javascript
// Porównaj dzisiejsze vs wczorajsze pageviews
const trending = todayViews.filter(
  (article) => article.views > yesterdayViews[article.title] * 1.5
)
```

### **2. Geographic Feed**

```javascript
// Artykuły z twojej okolicy
navigator.geolocation.getCurrentPosition((pos) => {
  const nearbyArticles = fetchNearbyArticles(
    pos.coords.latitude,
    pos.coords.longitude
  )
})
```

### **3. Category Explorer**

```javascript
// Przeglądaj według kategorii
const categoryArticles = await fetch(
  `https://pl.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Kategoria:${category}&format=json`
)
```

### **4. Search Integration**

```javascript
// Intelligent search z autocomplete
const suggestions = await fetch(
  `https://pl.wikipedia.org/w/api.php?action=opensearch&search=${query}&format=json`
)
```

### **5. Real-time Updates**

```javascript
// Live stream najnowszych zmian
const recentChanges = await fetch(
  "https://pl.wikipedia.org/w/api.php?action=query&list=recentchanges&format=json"
)
```

---

## 📖 **Dokumentacja i zasoby:**

### **Oficjalna dokumentacja:**

- **Wikipedia REST API:** https://en.wikipedia.org/api/rest_v1/
- **MediaWiki API:** https://www.mediawiki.org/wiki/API:Main_page
- **Analytics API:** https://doc.wikimedia.org/analytics-api/
- **Pageviews API:** https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/

### **Przydatne narzędzia:**

- **API Sandbox:** https://en.wikipedia.org/wiki/Special:ApiSandbox
- **Pageviews Analysis:** https://pageviews.wmcloud.org/
- **Wiki Stats:** https://stats.wikimedia.org/

### **Rate Limiting:**

- **200 requests/second** dla użytkowników
- **5000 requests/second** dla zarejestrowanych botów
- **User-Agent wymagany** w headerach

---

## 🎯 **Podsumowanie Nucleus MVP:**

✅ **Najpopularniejsze artykuły** - według rzeczywistych odwiedzin (30-dniowa agregacja)  
✅ **Infinity scroll** - nieskończone przewijanie z randomizacją  
✅ **Kategorie** - prawdziwe kategorie z MediaWiki API  
✅ **Cache 10 minut** - optymalizacja wydajności  
✅ **Ultra-prosty API** - maksymalna prostota użycia  
✅ **Responsive design** - działa na wszystkich urządzeniach

**Nucleus to kompletna platforma do odkrywania najciekawszych treści z polskiej Wikipedii!** 🚀📚

---

_Dokumentacja utworzona: September 4, 2025_  
_Wersja API: 1.0_  
_Autor: GitHub Copilot_
