import { ArrowRight, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { LandingCtaConfig } from "@/features/landing/landing.utils"

type LandingHeaderProps = {
  cta: LandingCtaConfig
}

export const LandingHeader = ({ cta }: LandingHeaderProps) => (
  <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
    <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <Link
        aria-label="War Mind landing page"
        className="group flex min-w-0 items-center gap-3"
        to="/"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="truncate text-sm font-semibold tracking-tight text-white">War Mind</span>
          <span className="hidden text-[11px] uppercase tracking-[0.22em] text-cyan-100/60 sm:block">
            Market command
          </span>
        </span>
      </Link>

      <nav aria-label="Landing sections" className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
        <a className="transition-colors hover:text-white" href="#workflow">
          Workflow
        </a>
        <a className="transition-colors hover:text-white" href="#systems">
          Systems
        </a>
        <a className="transition-colors hover:text-white" href="#agent">
          Super-Agent
        </a>
      </nav>

      <Button
        asChild
        className="h-9 rounded-full bg-cyan-100 px-4 text-zinc-950 shadow-none hover:bg-white active:scale-[0.98]"
        size="sm"
      >
        <Link to={cta.primaryHref}>
          {cta.primaryLabel}
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </div>
  </header>
)
