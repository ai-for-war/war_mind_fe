import { ChevronDown } from "lucide-react"
import type { MouseEvent } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LandingCtaLink } from "@/features/landing/components/landing-cta-link"
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

export const LandingHeader = ({ cta }: LandingHeaderProps) => (
  <header className="relative z-20 px-4 pt-5 sm:px-6">
    <div
      className="liquid-glass mx-auto flex min-h-14 w-full max-w-[850px] items-center justify-between gap-3 rounded-3xl px-3 py-2"
      data-landing-nav
    >
      <Link
        aria-label="Recap.ai landing page"
        className="flex min-w-0 items-center"
        to="/"
      >
        <span className="truncate text-xl font-semibold tracking-normal text-[hsl(var(--landing-hero-heading))]">
          Recap.ai
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
            onClick={(event) => handleNavClick(event, item.target)}
          >
            {item.label}
            {item.hasMenu ? <ChevronDown aria-hidden="true" className="size-3.5" /> : null}
          </a>
        ))}
      </nav>

      <Button asChild className="h-9 px-4 text-sm" size="sm" variant="hero">
        <LandingCtaLink to={cta.primaryHref}>{cta.primaryLabel}</LandingCtaLink>
      </Button>
    </div>
  </header>
)
