import React from "react"

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden">
      {/* Light mode - szare światło u dołu */}
      <div className="absolute -bottom-[100%] left-1/2 -translate-x-1/2 w-256 h-256 dark:hidden">
        <div className="w-full h-full rounded-full bg-gray-300/80 blur-3xl" />
      </div>

      {/* Dark mode - białe światło u dołu */}
      <div className="absolute -bottom-[100%] left-1/2 -translate-x-1/2 w-256 h-256 hidden dark:block">
        <div className="w-full h-full rounded-full bg-white/10 blur-2xl" />
      </div>
    </div>
  )
}
