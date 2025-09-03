import { NextResponse } from "next/server"
import { fetchPopularArticles } from "@/lib/wiki-ultra-simple"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const count = Math.min(parseInt(url.searchParams.get("count") || "8", 10), 10)
  const offset = parseInt(url.searchParams.get("offset") || "0", 10)

  console.log(`API called: count=${count}, offset=${offset}`)

  try {
    const result = await fetchPopularArticles("pl", count, offset)

    console.log(`API returning: ${result.items.length} items`)

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    )
  }
}
