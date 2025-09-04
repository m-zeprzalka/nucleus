# 🌌 Nucleus

**Odkryj fascynujące artykuły Wikipedii w pięknym, nieskończonym feedzie**

Nucleus to nowoczesna aplikacja webowa, która prezentuje historycznie znaczące artykuły Wikipedii w eleganckim, mobile-first interfejsie. Zbudowana w Next.js 15 i zasilana przez REST API Wikipedii.

[![Vercel](https://img.shields.io/badge/deployed-vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)

## ✨ Funkcje

- **🎯 Kurowany Kontent** - Historycznie znaczące artykuły z Wikipedii
- **♾️ Nieskończone Przewijanie** - Płynne doświadczenie przeglądania
- **🌓 Tryb Ciemny/Jasny** - Adaptacyjne przełączanie motywów
- **📱 Mobile First** - Responsywny design dla wszystkich urządzeń
- **⚡ Szybkie Ładowanie** - Zoptymalizowane z Next.js 15 i Turbopack
- **🎨 Nowoczesny UI** - Czysty design z komponentami shadcn/ui
- **🔍 Inteligentne Filtrowanie** - Odkrywanie treści według tematów

## 🏗️ Architektura

### Stack Technologiczny

- **Framework**: Next.js 15.5.2 z App Router
- **Język**: TypeScript 5.0
- **Stylowanie**: Tailwind CSS 4.0
- **Komponenty**: shadcn/ui + Radix UI
- **Ikony**: Lucide React
- **Motywy**: next-themes
- **Deployment**: Vercel

### Struktura Projektu

```
src/
├── app/                    # Next.js App Router
│   ├── api/wiki/          # Endpointy API dla danych Wikipedii
│   ├── globals.css        # Style globalne
│   ├── layout.tsx         # Layout główny
│   └── page.tsx          # Strona główna
├── components/            # Komponenty React
│   ├── ui/               # Komponenty shadcn/ui
│   ├── CardGemini.tsx    # Komponent karty artykułu
│   ├── Header.tsx        # Nagłówek nawigacji
│   ├── Tags.tsx          # Tagi filtrujące
│   └── ...               # Inne komponenty
└── lib/                  # Narzędzia i logika API
    ├── wiki-ultra-simple.ts  # Integracja z API Wikipedii
    └── utils.ts          # Funkcje pomocnicze
```

## 🔧 Integracja API

Nucleus integruje się z REST API Wikipedii aby pobrać:

- **Podsumowania artykułów** - Tytuł, extract, obrazy
- **Kategorie** - Klasyfikacja tematyczna
- **Znaczenie historyczne** - Algorytm najbardziej linkowanych artykułów
- **Kuracja treści** - Filtrowanie jakości i sanityzacja

### Główna Funkcja API

```typescript
export async function fetchPopularArticles(
  lang: string = "pl",
  count: number = 8,
  offset: number = 0
): Promise<PageResult>
```

## 🎨 Komponenty

### CardGemini

Główny komponent wyświetlania artykułów z:

- Responsywną obsługą obrazów
- Znaczkami kategorii
- Funkcją zakładek
- Integracją linków zewnętrznych

### Header

Komponent nawigacji z:

- Przełącznikiem motywu ciemny/jasny
- Responsywnym layoutem
- Czystym brandingiem

### Tags

System filtrowania treści:

- Filtrowanie według tematów
- Zarządzanie stanem aktywnym
- Płynne przejścia

## 🚀 Deployment

### Vercel (Rekomendowane)

```bash
# Build dla produkcji
npm run build

# Deploy na Vercel
vercel --prod
```

### Zmienne Środowiskowe

Nie są wymagane zmienne środowiskowe - używa publicznych API Wikipedii.

## 🔄 Workflow Deweloperski

```bash
# Rozwój z hot reload
npm run dev

# Sprawdzanie typów
npm run lint

# Build produkcyjny
npm run build

# Uruchom serwer produkcyjny
npm start
```

## 📱 Performance

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

### Optymalizacje

- **Optymalizacja obrazów** z komponentem Next.js Image
- **Code splitting** z dynamicznymi importami
- **Infinite scroll** dla lepszej percieved performance
- **Efektywne cache API** z odpowiednimi nagłówkami

## 🤝 Współpraca

1. Zforkuj repozytorium
2. Stwórz branch funkcji (`git checkout -b feature/amazing-feature`)
3. Commituj zmiany (`git commit -m 'Dodaj amazing feature'`)
4. Push do brancha (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik [LICENSE](LICENSE) po szczegóły.

## 🙏 Podziękowania

- **Wikipedia** - Za zapewnienie darmowego dostępu do ludzkiej wiedzy
- **Vercel** - Za doskonałe narzędzia hostingu i deploymentu
- **shadcn/ui** - Za piękne, dostępne komponenty
- **Zespół Next.js** - Za niesamowity framework

## 📞 Kontakt

**Michał Zeprzalka** - [@m-zeprzalka](https://github.com/m-zeprzalka)

Link do Projektu: [https://github.com/m-zeprzalka/nucleus](https://github.com/m-zeprzalka/nucleus)

---

**Stworzone z ❤️ i nieskończoną wiedzą Wikipedii**
