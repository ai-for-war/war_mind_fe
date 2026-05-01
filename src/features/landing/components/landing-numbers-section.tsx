import { LandingHlsVideo } from "@/features/landing/components/landing-video"

const numbersVideoUrl =
  "https://stream.mux.com/Kec29dVyJgiPdtWaQtPuEiiGHkJIYQAVUJcNiIHUYeo.m3u8"

const numbersOverlay =
  "linear-gradient(to top, hsl(260 87% 3%) 0%, hsl(260 87% 3% / 0.85) 15%, hsl(260 87% 3% / 0.4) 40%, hsl(260 87% 3% / 0.15) 60%, hsl(260 87% 3% / 0.3) 100%)"

export const LandingNumbersSection = () => (
  <section className="relative overflow-hidden px-4 sm:px-6" id="numbers">
    <LandingHlsVideo className="absolute inset-0 size-full object-cover" src={numbersVideoUrl} />
    <div aria-hidden="true" className="absolute inset-0" style={{ background: numbersOverlay }} />

    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center py-32 text-center">
      <div className="mb-24" data-landing-reveal>
        <p className="text-7xl font-semibold tracking-normal text-hero-heading sm:text-[8rem] lg:text-[10rem]">
          15m
        </p>
        <p className="mt-2 text-xl font-medium text-hero-heading">Fastest research cadence</p>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-hero-sub opacity-70">
          Recurring stock research can keep working after the first question, giving analysts a
          repeatable coverage loop instead of a one-off answer.
        </p>
      </div>

      <div
        className="liquid-glass grid w-full max-w-4xl rounded-3xl p-8 text-left sm:p-12 md:grid-cols-2"
        data-landing-card-group
      >
        <div
          className="border-b border-[hsl(var(--landing-border))]/50 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-12"
          data-landing-card
        >
          <p className="text-5xl font-semibold text-hero-heading">5+</p>
          <p className="mt-3 text-base text-hero-sub opacity-70">Stock workflow surfaces connected</p>
        </div>
        <div className="pt-8 md:pl-12 md:pt-0" data-landing-card>
          <p className="text-5xl font-semibold text-hero-heading">Plan-first</p>
          <p className="mt-3 text-base text-hero-sub opacity-70">Super-Agent execution model</p>
        </div>
      </div>
    </div>
  </section>
)
