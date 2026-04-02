import type { PropsWithChildren } from "react"

export const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.18),transparent_48%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.14),transparent_42%)]" />
      <div className="relative flex min-h-svh items-center justify-center p-6">
        {children}
      </div>
    </main>
  )
}
