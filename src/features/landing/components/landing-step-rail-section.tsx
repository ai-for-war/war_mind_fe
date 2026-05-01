import { LandingSectionBadge } from "@/features/landing/components/landing-section-badge"
import { landingSteps } from "@/features/landing/landing.utils"

export const LandingStepRailSection = () => (
  <section className="px-4 py-32 sm:px-6" id="workflow">
    <div
      className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:items-start"
      data-landing-step-rail
    >
      <div className="lg:sticky lg:top-16" data-landing-reveal>
        <LandingSectionBadge label="Agent Run Path" value="Scroll" />
        <h2 className="mt-6 text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">From Market Signal</span>
          <span className="block">to Actionable Recap</span>
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-hero-sub opacity-75">
          The workflow moves step by step: scan, recap, schedule, agent plan, then risk
          review. The vertical rail shows how work progresses as the user scrolls.
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-5 top-8 w-px bg-[hsl(var(--landing-border))]/60 sm:left-6"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-5 top-8 w-px origin-top scale-y-0 bg-[hsl(var(--landing-primary))] sm:left-6"
          data-landing-step-line
        />

        <div className="flex flex-col gap-5">
          {landingSteps.map((step, index) => (
            <article
              className="relative grid gap-4 pl-14 sm:grid-cols-[8rem_minmax(0,1fr)] sm:pl-20"
              data-landing-step
              key={step.title}
            >
              <div className="absolute left-0 top-7 flex size-10 items-center justify-center rounded-full bg-[hsl(var(--landing-background))] sm:size-12">
                <div className="liquid-glass flex size-8 items-center justify-center rounded-full text-xs font-semibold text-[hsl(var(--landing-primary))] sm:size-10">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>

              <div className="pt-7 text-sm font-medium text-[hsl(var(--landing-primary))]">
                {step.eyebrow}
              </div>

              <div className="liquid-glass rounded-3xl p-6 transition-colors hover:bg-white/[0.03] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight text-hero-heading">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-hero-sub opacity-72">
                      {step.description}
                    </p>
                  </div>
                  <span className="liquid-glass inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[hsl(var(--landing-primary))]">
                    {step.metric}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
)
