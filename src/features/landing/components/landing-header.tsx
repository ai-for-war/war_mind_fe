import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react"
import type { MouseEvent } from "react"

import { Button } from "@/components/ui/button"
import { LandingCtaLink } from "@/features/landing/components/landing-cta-link"
import type { LandingCtaConfig } from "@/features/landing/landing.utils"
import { cn } from "@/lib/utils"

type LandingHeaderProps = {
  cta: LandingCtaConfig
}

type HeaderNavItem = {
  description: string
  hasMenu?: boolean
  label: string
  target: string
}

const navItems: HeaderNavItem[] = [
  {
    description: "Stock radar, watchlists, risk notes",
    label: "Platform",
    target: "#features",
  },
  {
    description: "Step-by-step research workflow",
    label: "Workflow",
    target: "#workflow",
  },
  {
    description: "User, Vietnam stocks, models, review",
    label: "Model flow",
    target: "#model-flow",
  },
  {
    description: "Routing into supported app surfaces",
    label: "Routing",
    target: "#routing",
  },
  {
    description: "Request early access",
    label: "Access",
    target: "#request-access",
  },
]

const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
  const targetElement = document.querySelector(target)

  if (!targetElement) {
    return
  }

  event.preventDefault()

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  targetElement.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  })

  window.history.pushState(null, "", target)
}

export const LandingHeader = ({ cta }: LandingHeaderProps) => {
  return (
    <header className="fixed inset-x-0 top-0 z-30 px-3 pt-4 sm:px-6">
      <div
        className="liquid-glass mx-auto grid min-h-[4.5rem] w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[2rem] px-5 py-3 shadow-[0_18px_70px_-45px_rgba(0,0,0,0.9)] sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
        data-landing-nav
      >
        <a
          aria-label="Recap.ai landing page"
          className="flex min-w-0 items-center pl-1"
          href="#hero"
          onClick={(event) => handleNavClick(event, "#hero")}
        >
          <span className="min-w-0">
            <span className="block truncate text-xl font-semibold leading-tight tracking-normal text-[hsl(var(--landing-hero-heading))]">
              Recap.ai
            </span>
            <span className="hidden text-xs leading-tight text-hero-sub opacity-55 sm:block">
              Vietnam market intelligence
            </span>
          </span>
        </a>

        <nav
          aria-label="Landing sections"
          className="hidden items-center rounded-full border border-[hsl(var(--landing-border))]/45 bg-white/[0.018] px-2 py-1.5 text-sm text-[hsl(var(--landing-hero-sub))] lg:flex"
        >
          {navItems.map((item) => (
            <a
              className={cn(
                "group relative inline-flex h-10 items-center gap-1.5 rounded-full px-4 transition-colors",
                "hover:bg-white/[0.05] hover:text-[hsl(var(--landing-hero-heading))]",
              )}
              href={item.target}
              key={item.label}
              onClick={(event) => handleNavClick(event, item.target)}
            >
              <span>{item.label}</span>
              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.7rem)] hidden w-56 -translate-x-1/2 rounded-2xl border border-[hsl(var(--landing-border))]/45 bg-[hsl(var(--landing-card))]/95 px-4 py-3 text-xs leading-5 text-hero-sub opacity-0 shadow-2xl backdrop-blur-xl transition-opacity group-hover:block group-hover:opacity-100">
                {item.description}
              </span>
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 pr-1">
          <Button
            asChild
            className="hidden h-10 px-4 text-sm md:inline-flex"
            size="sm"
            variant="heroSecondary"
          >
            <LandingCtaLink to={cta.secondaryHref}>
              <Sparkles aria-hidden="true" className="size-4" />
              Super-Agent
            </LandingCtaLink>
          </Button>

          <Button asChild className="h-10 px-4 text-sm" size="sm" variant="hero">
            <LandingCtaLink to={cta.primaryHref}>
              {cta.primaryLabel}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </LandingCtaLink>
          </Button>

        </div>
      </div>

      <nav
        aria-label="Landing quick sections"
        className="mx-auto mt-2 flex w-full max-w-7xl gap-2 overflow-x-auto px-1 pb-1 text-xs text-hero-sub lg:hidden"
      >
        {navItems.slice(0, 4).map((item) => (
          <a
            className="liquid-glass inline-flex shrink-0 items-center rounded-full px-3 py-2"
            href={item.target}
            key={item.label}
            onClick={(event) => handleNavClick(event, item.target)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
