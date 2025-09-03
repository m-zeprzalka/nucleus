import { ModeToggle } from "@/components/Toogle"
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/65 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-foreground"></div>
          <h1 className="text-xl font-semibold">Nucleus</h1>
        </div>
        <div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
