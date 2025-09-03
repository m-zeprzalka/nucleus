import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedBackground } from "@/components/AnimatedBackground"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Lepsze loading fontów
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Nucleus - aplikacja do mikronauki z API Wikipedii",
    template: "%s | Nucleus",
  },
  description:
    "Nucleus to inteligentna aplikacja do odkrywania najciekawszych artykułów z całej historii Wikipedii. Losowe, fascynujące treści z całego świata.",
  keywords: ["Wikipedia", "edukacja", "wiedza", "artykuły", "nauka"],
  authors: [{ name: "Michał Zeprzałka" }],
  creator: "Nucleus",
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://nucleus.vercel.app",
    title: "Nucleus - Odkryj fascynujący świat Wikipedii",
    description:
      "Inteligentna aplikacja do odkrywania najciekawszych artykułów z całej historii Wikipedii",
    siteName: "Nucleus",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nucleus - Odkryj fascynujący świat Wikipedii",
    description:
      "Inteligentna aplikacja do odkrywania najciekawszych artykułów z całej historii Wikipedii",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnimatedBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
