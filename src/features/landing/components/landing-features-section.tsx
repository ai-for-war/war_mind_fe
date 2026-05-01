import { LandingHlsVideo } from "@/features/landing/components/landing-video"
import { LandingSectionBadge } from "@/features/landing/components/landing-section-badge"
import { landingFeatureCards } from "@/features/landing/landing.utils"

const featuresVideoUrl =
  "https://stream.mux.com/Jwr2RhmsNrd6GEspBNgm02vJsRZAGlaoQIh4AucGdASw.m3u8"

export const LandingFeaturesSection = () => (
  <section className="relative overflow-hidden px-4 py-32 sm:px-6" id="features">
    <LandingHlsVideo className="absolute inset-0 size-full object-cover" src={featuresVideoUrl} />
    <div aria-hidden="true" className="absolute inset-0 bg-[hsl(var(--landing-background))]/40" />
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-[hsl(var(--landing-background))] via-[hsl(var(--landing-background))]/80 to-transparent"
    />
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[hsl(var(--landing-background))] via-[hsl(var(--landing-background))]/80 to-transparent"
    />

    <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-14">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <LandingSectionBadge label="Core Platform" value="Overview" />
        <h2 className="mt-6 text-3xl font-semibold leading-[1.05] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">Built for Analysts That</span>
          <span className="block">Ship Relentlessly</span>
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-hero-sub opacity-75">
          Three pillars that keep your market intelligence loop moving without the
          operational drag.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {landingFeatureCards.map((feature) => (
          <article
            className="liquid-glass rounded-3xl p-8 transition-colors hover:bg-white/[0.03]"
            key={feature.title}
          >
            <p className="text-sm font-medium text-[hsl(var(--landing-primary))]">
              {feature.eyebrow}
            </p>
            <h3 className="mt-5 text-2xl font-semibold leading-tight text-hero-heading">
              {feature.title}
            </h3>
            <p className="mt-4 min-h-28 text-sm leading-6 text-hero-sub opacity-75">
              {feature.description}
            </p>
            <div className="mt-8 border-t border-[hsl(var(--landing-border))]/50 pt-6">
              <p className="text-3xl font-semibold text-hero-heading">{feature.stat}</p>
              <p className="mt-1 text-sm text-hero-sub opacity-60">{feature.statLabel}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
