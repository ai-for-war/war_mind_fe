import landingBackgroundImage from "@/assets/images/bg7.jpg"
import { LandingFeatureGrid } from "@/features/landing/components/landing-feature-grid"
import { LandingFinalCta } from "@/features/landing/components/landing-final-cta"
import { LandingHeader } from "@/features/landing/components/landing-header"
import { LandingHero } from "@/features/landing/components/landing-hero"
import { LandingMarketTicker } from "@/features/landing/components/landing-market-ticker"
import { LandingWorkflowStory } from "@/features/landing/components/landing-workflow-story"
import { getLandingCtaConfig } from "@/features/landing/landing.utils"
import { useAuthStore } from "@/stores/use-auth-store"

export const LandingPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const cta = getLandingCtaConfig(isAuthenticated)

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-zinc-950 text-zinc-50">
      <img
        alt=""
        aria-hidden="true"
        className="fixed inset-0 h-full w-full object-cover opacity-20"
        src={landingBackgroundImage}
      />
      <div aria-hidden="true" className="fixed inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.7)_0%,rgba(9,9,11,0.94)_46%,rgba(9,9,11,1)_100%)]" />
      <div aria-hidden="true" className="fixed inset-0 bg-[radial-gradient(42rem_30rem_at_78%_14%,rgba(34,211,238,0.18),transparent_62%),radial-gradient(30rem_24rem_at_8%_35%,rgba(16,185,129,0.1),transparent_64%)]" />

      <div className="relative">
        <LandingHeader cta={cta} />
        <main>
          <LandingHero cta={cta} />
          <LandingMarketTicker />
          <LandingWorkflowStory />
          <LandingFeatureGrid />
          <LandingFinalCta cta={cta} />
        </main>
      </div>
    </div>
  )
}
