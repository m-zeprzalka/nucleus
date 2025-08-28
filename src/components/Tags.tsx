import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export function Tags() {
  const tags = [
    "Historia",
    "Medycyna",
    "Technologia",
    "Informatyka",
    "Matematyka",
    "Fizyka",
    "Biologia",
    "Kultura",
  ]
  const [selected, setSelected] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selected.includes(tag) ? "default" : "secondary"}
          className="cursor-pointer px-4 py-2"
          onClick={() => toggleTag(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
