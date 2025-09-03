import { NextResponse } from "next/server"
import { fetchPopularArticles } from "@/lib/wiki-ultra-simple"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const count = Math.min(parseInt(url.searchParams.get("count") || "8", 10), 12) // max 12 artykułów
  const offset = parseInt(url.searchParams.get("offset") || "0", 10)

  console.log(
    `API called: count=${count}, offset=${offset} (HISTORICAL RANDOM MODE)`
  )

  try {
    const result = await fetchPopularArticles("pl", count, offset)

    console.log(`API returning: ${result.items.length} historical articles`)

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store", // Zawsze świeże losowe artykuły
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch historical articles" },
      { status: 500 }
    )
  }
}
