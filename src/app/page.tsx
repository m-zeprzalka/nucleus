"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Tags } from "@/components/Tags"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"

export default function Home() {
  const [remembered, setRemembered] = useState(false)

  return (
    <div>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-4">
        <Tags />
        <div className="grid gap-4">
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl font-semibold leading-snug">
                Powstanie Warszawskie - 1 sie 1944
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs py-2 px-4">
                  Historia
                </Badge>
                <Badge variant="outline" className="text-xs py-2 px-4">
                  II Wojna Światowa
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              W czasie walk w Warszawie zginęło ok. 18 tys. powstańców, a 25
              tys. zostało rannych. Straty ludności cywilnej wynosiły ok. 180
              tys. zabitych.
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-3 pb-3 border-t border-gray-100 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-2"
                onClick={() => setRemembered(!remembered)}
              >
                {remembered ? (
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
                {remembered ? "Zapamiętane" : "Do zapamiętania"}
              </Button>

              {/* Source */}
              <Badge variant="outline" className="text-xs text-gray-500">
                Wikipedia
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
