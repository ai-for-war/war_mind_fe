import { ArrowRight, ChartCandlestick } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LandingProductPreview } from "@/features/landing/components/landing-product-preview"
import type { LandingCtaConfig } from "@/features/landing/landing.utils"

type LandingHeroProps = {
  cta: LandingCtaConfig
}

export const LandingHero = ({ cta }: LandingHeroProps) => (
  <section className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
    <div className="landing-hero-copy flex max-w-3xl flex-col items-start gap-7">
      <Badge
        className="border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-cyan-100"
        variant="outline"
      >
        <ChartCandlestick className="size-3.5" aria-hidden="true" />
        Market intelligence workspace
      </Badge>

      <div className="flex flex-col gap-5">
        <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Stock research that keeps working.
        </h1>
        <p className="max-w-[62ch] text-base leading-7 text-zinc-300 sm:text-lg">
          War Mind brings the stock catalog, AI research reports, recurring schedules,
          backtests, watchlists, and Super-Agent conversations into one decision surface.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button
          asChild
          className="h-11 rounded-full bg-cyan-100 px-6 text-zinc-950 shadow-none hover:bg-white active:scale-[0.98]"
          size="lg"
        >
          <Link to={cta.primaryHref}>
            {cta.primaryLabel}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          asChild
          className="h-11 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 active:scale-[0.98]"
          size="lg"
          variant="outline"
        >
          <Link to={cta.secondaryHref}>{cta.secondaryLabel}</Link>
        </Button>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
        {["Stock catalog", "AI reports", "Plan-driven agent"].map((item) => (
          <div className="flex flex-col gap-1" key={item}>
            <span className="text-sm font-medium text-zinc-100">{item}</span>
            <span className="text-xs leading-5 text-zinc-500">Backed by current app routes</span>
          </div>
        ))}
      </div>
    </div>

    <LandingProductPreview />
  </section>
)
