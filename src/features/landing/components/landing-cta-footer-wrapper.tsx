import { Link } from "react-router-dom"

import { LandingAccessForm } from "@/features/landing/components/landing-access-form"
import { LandingLocalVideo } from "@/features/landing/components/landing-video"
import { landingFooterGroups } from "@/features/landing/landing.utils"

const footerOverlay =
  "linear-gradient(to bottom, hsl(260 87% 3%) 0%, hsl(260 87% 3% / 0.85) 15%, hsl(260 87% 3% / 0.4) 40%, hsl(260 87% 3% / 0.15) 60%, hsl(260 87% 3% / 0.3) 100%)"

export const LandingCtaFooterWrapper = () => (
  <section className="relative overflow-hidden px-4 sm:px-6" id="footer">
    <LandingLocalVideo
      className="absolute inset-0 size-full object-cover"
      mp4Src="/videos/footer.mp4"
      webmSrc="/videos/footer.webm"
    />
    <div aria-hidden="true" className="absolute inset-0" style={{ background: footerOverlay }} />

    <div className="relative z-10 mx-auto max-w-6xl py-32">
      <div
        className="liquid-glass scroll-mt-8 rounded-[2rem] p-8 sm:p-12 lg:p-16"
        data-landing-reveal
        id="request-access"
      >
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="text-left">
            <p className="text-sm font-medium text-[hsl(var(--landing-primary))]">
              Request access
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
              <span className="block">Get Early Access</span>
              <span className="block">to Recap.ai</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-hero-sub opacity-75">
              Tell us what you want Recap.ai to track first. We will use this to shape the
              early-access workflow before wiring the production intake endpoint.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4 border-t border-[hsl(var(--landing-border))]/50 pt-6">
              <div>
                <p className="text-2xl font-semibold text-hero-heading">15m</p>
                <p className="mt-1 text-sm text-hero-sub opacity-55">research cadence</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-hero-heading">Plan</p>
                <p className="mt-1 text-sm text-hero-sub opacity-55">visible agent runs</p>
              </div>
            </div>
          </div>

          <LandingAccessForm />
        </div>
      </div>

      <footer
        className="mt-24 border-t border-[hsl(var(--landing-border))]/30 pt-12"
        data-landing-reveal
      >
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link aria-label="Recap.ai home" className="inline-flex items-center" to="/">
              <span className="text-xl font-semibold text-hero-heading">Recap.ai</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-hero-sub opacity-60">
              A stock research and Super-Agent surface for teams that need market context to
              keep moving.
            </p>
          </div>

          {landingFooterGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-hero-heading">{group.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      className="text-sm text-hero-sub opacity-60 transition-opacity hover:opacity-100"
                      href="#features"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[hsl(var(--landing-border))]/30 pt-6 text-sm text-hero-sub opacity-55 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 Recap.ai Inc.</p>
          <div className="flex gap-5">
            <a className="transition-opacity hover:opacity-100" href="#footer">
              Privacy
            </a>
            <a className="transition-opacity hover:opacity-100" href="#footer">
              Terms
            </a>
            <a className="transition-opacity hover:opacity-100" href="#footer">
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  </section>
)
