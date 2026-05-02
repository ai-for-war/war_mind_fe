import { Button } from "@/components/ui/button"
import { LandingCtaLink } from "@/features/landing/components/landing-cta-link"
import { LandingSectionBadge } from "@/features/landing/components/landing-section-badge"
import { LandingLocalVideo } from "@/features/landing/components/landing-video"
import {
  landingPipelineStats,
  landingRoutingBullets,
  type LandingCtaConfig,
} from "@/features/landing/landing.utils"

type LandingChessSectionProps = {
  cta: LandingCtaConfig
}

export const LandingChessSection = ({ cta }: LandingChessSectionProps) => (
  <section className="px-4 py-32 sm:px-6" id="routing">
    <div className="mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-2">
      <div className="liquid-glass aspect-[4/3] overflow-hidden rounded-3xl" data-landing-panel>
        <LandingLocalVideo
          mp4Src="/videos/routing.mp4"
          webmSrc="/videos/routing.webm"
        />
      </div>

      <div className="flex flex-col items-start" data-landing-reveal>
        <LandingSectionBadge label="Smart Routing" value="New" />
        <h2 className="mt-6 text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">Every Signal Finds</span>
          <span className="block">Its Perfect Path</span>
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-hero-sub opacity-75">
          Intelligent request shaping meets adaptive routing. Each Vietnam stock question can
          move toward a report, schedule, backtest context, or Super-Agent research run.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {landingRoutingBullets.map((item) => (
            <li className="flex items-center gap-3 text-sm text-hero-sub" key={item.label}>
              <span className="size-1.5 rounded-full bg-[hsl(var(--landing-primary))]" />
              {item.label}
            </li>
          ))}
        </ul>

        <div className="mt-9 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Button asChild className="h-12" size="lg" variant="hero">
            <LandingCtaLink to={cta.primaryHref}>See It in Action</LandingCtaLink>
          </Button>
          <Button asChild className="h-12" size="lg" variant="heroSecondary">
            <LandingCtaLink to={cta.secondaryHref}>Read the Flow</LandingCtaLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
)

export const LandingReverseChessSection = ({ cta }: LandingChessSectionProps) => (
  <section className="px-4 py-32 sm:px-6" id="pipeline">
    <div className="mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-2">
      <div className="order-2 flex flex-col items-start lg:order-1" data-landing-reveal>
        <LandingSectionBadge label="Pipeline Studio" value="Beta" />
        <h2 className="mt-6 text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">Design Research Loops</span>
          <span className="block">That Actually Compound</span>
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-hero-sub opacity-75">
          Pair watchlists, AI reports, recurring schedules, backtest context, and risk
          checklists so every trade idea has a visible research trail.
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-4" data-landing-card-group>
          {landingPipelineStats.map((stat) => (
            <div className="liquid-glass rounded-2xl p-4" data-landing-card key={stat.label}>
              <p className="text-2xl font-semibold text-hero-heading">{stat.metric}</p>
              <p className="mt-1 text-sm leading-5 text-hero-sub opacity-60">{stat.label}</p>
            </div>
          ))}
        </div>

        <Button asChild className="mt-9 h-12" size="lg" variant="hero">
          <LandingCtaLink to={cta.primaryHref}>Try Research Studio</LandingCtaLink>
        </Button>
      </div>

      <div
        className="liquid-glass order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2"
        data-landing-panel
      >
        <LandingLocalVideo
          mp4Src="/videos/pipeline.mp4"
          webmSrc="/videos/pipeline.webm"
        />
      </div>
    </div>
  </section>
)
