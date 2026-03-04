import type { PropsWithChildren } from "react"

export const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative min-h-svh overflow-hidden bg-neutral-950 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),transparent_55%)]" />
      <div className="relative flex min-h-svh items-center justify-center p-6">
        {children}
      </div>
    </main>
  )
}
