// src/components/CardGemini.tsx - ZAKTUALIZOWANA WERSJA

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react"

type RelatedTopic = {
  title: string
  pageid: number
}

type CardFeedFinalProps = {
  title: string
  extract: string
  categories: string[]
  source: string
  image?: string
  relatedTopics?: RelatedTopic[]
}

export function CardFeedFinal({
  title,
  extract,
  categories,
  source,
  image,
  relatedTopics,
}: CardFeedFinalProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const sourceUrl = `https://${source}/wiki/${title.replace(/ /g, "_")}`

  return (
    <Card>
      {image && (
        <div className="relative aspect-video w-full -mt-6 rounded-ful">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-ful"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-base text-card-foreground/90 leading-relaxed">
          {extract}
        </p>
      </CardContent>
      {/* ZMIANA: Lekko zmodyfikowana logika stopki */}
      <CardFooter className="flex items-center justify-between p-3 -mb-6 bg-background/5 backdrop-blur supports-[backdrop-filter]:bg-background/10">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text" />
          ) : (
            <Bookmark className="h-5 w-5" />
          )}
          <span className={isBookmarked ? "font-semibold" : ""}>
            {isBookmarked ? "Zapisano" : "Zapisz"}
          </span>
        </Button>

        {/* ZMIANA: Popover jest teraz renderowany zawsze, a jego zawartość jest warunkowa */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Odkryj więcej
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Opcje</h4>
                <p className="text-sm text-muted-foreground">
                  Zobacz pełny artykuł lub eksploruj powiązane hasła.
                </p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={sourceUrl} target="_blank">
                    Zobacz źródło w Wikipedii
                  </Link>
                </Button>
              </div>

              {/* Sekcja "Powiązane tematy" renderuje się tylko, gdy ma co wyświetlić */}
              {relatedTopics && relatedTopics.length > 0 && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    {relatedTopics.map((topic) => (
                      <Link
                        key={topic.pageid}
                        href={`https://${source}/wiki/${topic.title.replace(
                          / /g,
                          "_"
                        )}`}
                        target="_blank"
                        className="text-sm font-medium p-2 hover:bg-accent rounded-md cursor-pointer"
                      >
                        {topic.title}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  )
}
