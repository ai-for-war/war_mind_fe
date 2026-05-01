import { ChevronDown, Crosshair } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { LandingCtaConfig } from "@/features/landing/landing.utils"

type LandingHeaderProps = {
  cta: LandingCtaConfig
}

const navItems = [
  { hasMenu: true, label: "Features", target: "#features" },
  { hasMenu: false, label: "Solutions", target: "#routing" },
  { hasMenu: false, label: "Plans", target: "#numbers" },
  { hasMenu: true, label: "Learning", target: "#footer" },
]

export const LandingHeader = ({ cta }: LandingHeaderProps) => (
  <header className="relative z-20 px-4 pt-5 sm:px-6">
    <div className="liquid-glass mx-auto flex min-h-14 w-full max-w-[850px] items-center justify-between gap-3 rounded-3xl px-3 py-2">
      <Link
        aria-label="War Mind landing page"
        className="flex min-w-0 items-center gap-2.5"
        to="/"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-[hsl(var(--landing-secondary))] to-[hsl(var(--landing-muted))] text-[hsl(var(--landing-primary))] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <Crosshair aria-hidden="true" className="size-4" />
        </span>
        <span className="truncate text-xl font-semibold tracking-normal text-[hsl(var(--landing-hero-heading))]">
          WARMIND
        </span>
      </Link>

      <nav
        aria-label="Landing sections"
        className="hidden items-center gap-5 text-sm text-[hsl(var(--landing-hero-sub))] lg:flex"
      >
        {navItems.map((item) => (
          <a
            className="inline-flex items-center gap-1 transition-colors hover:text-[hsl(var(--landing-hero-heading))]"
            href={item.target}
            key={item.label}
          >
            {item.label}
            {item.hasMenu ? <ChevronDown aria-hidden="true" className="size-3.5" /> : null}
          </a>
        ))}
      </nav>

      <Button asChild className="h-9 px-4 text-sm" size="sm" variant="hero">
        <Link to={cta.primaryHref}>{cta.primaryLabel}</Link>
      </Button>
    </div>
  </header>
)
