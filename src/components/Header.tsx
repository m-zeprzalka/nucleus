import { ModeToggle } from "@/components/Toogle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/65 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <h1 className="text-xl font-semibold">Nucleus</h1>
        <div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
