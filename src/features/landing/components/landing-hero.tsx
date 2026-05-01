import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LandingHeader } from "@/features/landing/components/landing-header"
import { LandingSectionBadge } from "@/features/landing/components/landing-section-badge"
import {
  landingTickers,
  type LandingCtaConfig,
} from "@/features/landing/landing.utils"

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260309_042944_4a2205b7-b061-490a-852b-92d9e9955ce9.mp4"

const heroOverlay =
  "linear-gradient(to bottom, transparent 0%, transparent 30%, hsl(260 87% 3% / 0.1) 45%, hsl(260 87% 3% / 0.4) 60%, hsl(260 87% 3% / 0.75) 75%, hsl(260 87% 3%) 95%)"

type LandingHeroProps = {
  cta: LandingCtaConfig
}

export const LandingHero = ({ cta }: LandingHeroProps) => {
  const marqueeItems = [...landingTickers, ...landingTickers]

  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
      >
        <source src={heroVideoUrl} type="video/mp4" />
      </video>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: heroOverlay }} />
      <div aria-hidden="true" className="absolute inset-0 bg-[hsl(var(--landing-background))]/25" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <LandingHeader cta={cta} />

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
          <LandingSectionBadge label="Research Schedules Live" value="Explore" />

          <h1 className="mt-7 max-w-5xl text-4xl font-semibold leading-[1.05] tracking-normal text-hero-heading sm:text-6xl lg:text-7xl">
            <span className="block">Accelerate Your</span>
            <span className="block">Market Research Now</span>
          </h1>

          <p className="mt-4 max-w-md text-lg leading-7 text-hero-sub opacity-80">
            Drive your stock workflow forward with clever schedules, sourced analytics, and
            plan-driven Super-Agent management.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
            <Button asChild className="h-12 w-full sm:w-auto" size="lg" variant="hero">
              <Link to={cta.primaryHref}>Start Research Right Now</Link>
            </Button>
            <Button
              asChild
              className="h-12 w-full sm:w-auto"
              size="lg"
              variant="heroSecondary"
            >
              <Link to={cta.secondaryHref}>Ask Super-Agent</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-center">
          <p className="max-w-52 text-sm leading-5 text-[hsl(var(--landing-foreground))]/50">
            Designed for analysts tracking moving markets
          </p>

          <div className="overflow-hidden">
            <div className="animate-marquee flex w-max items-center gap-4">
              {marqueeItems.map((ticker, index) => (
                <div
                  className="flex min-w-36 items-center gap-2 text-sm text-[hsl(var(--landing-foreground))]/65"
                  key={`${ticker.name}-${index}`}
                >
                  <span className="liquid-glass flex size-6 items-center justify-center rounded-lg text-xs font-semibold text-[hsl(var(--landing-primary))]">
                    {ticker.token}
                  </span>
                  <span>{ticker.name}</span>
                  <ChevronRight aria-hidden="true" className="size-3 opacity-35" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
