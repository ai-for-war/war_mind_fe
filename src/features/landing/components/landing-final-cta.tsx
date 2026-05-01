import { ArrowRight, Bot } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { LandingCtaConfig } from "@/features/landing/landing.utils"

type LandingFinalCtaProps = {
  cta: LandingCtaConfig
}

export const LandingFinalCta = ({ cta }: LandingFinalCtaProps) => (
  <section className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-14 sm:px-6 lg:px-8" id="agent">
    <div className="overflow-hidden rounded-[2rem] border border-cyan-200/15 bg-cyan-200/[0.06] p-6 shadow-[0_28px_90px_-55px_rgba(103,232,249,0.9)] sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Put the analyst loop on the first screen.
          </h2>
          <p className="text-base leading-7 text-zinc-300">
            Users should land on a clear path: choose a stock, generate a sourced report, schedule
            recurring coverage, and escalate synthesis to Super-Agent when judgment matters.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
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
      </div>
    </div>
  </section>
)
