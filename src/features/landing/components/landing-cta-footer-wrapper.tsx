import { Crosshair } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LandingHlsVideo } from "@/features/landing/components/landing-video"
import {
  landingFooterGroups,
  type LandingCtaConfig,
} from "@/features/landing/landing.utils"

const footerVideoUrl =
  "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8"

const footerOverlay =
  "linear-gradient(to bottom, hsl(260 87% 3%) 0%, hsl(260 87% 3% / 0.85) 15%, hsl(260 87% 3% / 0.4) 40%, hsl(260 87% 3% / 0.15) 60%, hsl(260 87% 3% / 0.3) 100%)"

type LandingCtaFooterWrapperProps = {
  cta: LandingCtaConfig
}

export const LandingCtaFooterWrapper = ({ cta }: LandingCtaFooterWrapperProps) => (
  <section className="relative overflow-hidden px-4 sm:px-6" id="footer">
    <LandingHlsVideo className="absolute inset-0 size-full object-cover" src={footerVideoUrl} />
    <div aria-hidden="true" className="absolute inset-0" style={{ background: footerOverlay }} />

    <div className="relative z-10 mx-auto max-w-6xl py-32">
      <div className="liquid-glass rounded-[2rem] p-10 text-center sm:p-20">
        <h2 className="text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">Ready to Outpace</span>
          <span className="block">Your Research Targets?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-hero-sub opacity-75">
          Bring recurring stock coverage, sourced reports, and Super-Agent planning into one
          premium market workspace.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild className="h-12" size="lg" variant="hero">
            <Link to={cta.primaryHref}>Start Research Today</Link>
          </Button>
          <Button asChild className="h-12" size="lg" variant="heroSecondary">
            <Link to={cta.secondaryHref}>Talk to Super-Agent</Link>
          </Button>
        </div>
      </div>

      <footer className="mt-24 border-t border-[hsl(var(--landing-border))]/30 pt-12">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link aria-label="War Mind home" className="inline-flex items-center gap-3" to="/">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-b from-[hsl(var(--landing-secondary))] to-[hsl(var(--landing-muted))] text-[hsl(var(--landing-primary))]">
                <Crosshair aria-hidden="true" className="size-5" />
              </span>
              <span className="text-xl font-semibold text-hero-heading">WARMIND</span>
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
          <p>2026 War Mind Inc.</p>
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
