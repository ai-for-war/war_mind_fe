import {
  LandingChessSection,
  LandingReverseChessSection,
} from "@/features/landing/components/landing-chess-section"
import { LandingCtaFooterWrapper } from "@/features/landing/components/landing-cta-footer-wrapper"
import { LandingFeaturesSection } from "@/features/landing/components/landing-features-section"
import { LandingGsapEffects } from "@/features/landing/components/landing-gsap-effects"
import { LandingHero } from "@/features/landing/components/landing-hero"
import { LandingNumbersSection } from "@/features/landing/components/landing-numbers-section"
import { LandingResearchBeamSection } from "@/features/landing/components/landing-research-beam-section"
import { LandingStepRailSection } from "@/features/landing/components/landing-step-rail-section"
import { LandingTestimonialsSection } from "@/features/landing/components/landing-testimonials-section"
import { getLandingCtaConfig } from "@/features/landing/landing.utils"
import { useAuthStore } from "@/stores/use-auth-store"

export const LandingPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const cta = getLandingCtaConfig(isAuthenticated)

  return (
    <div className="landing-apex relative min-h-[100dvh] overflow-x-hidden bg-[hsl(var(--landing-background))] text-[hsl(var(--landing-foreground))]">
      <LandingGsapEffects />
      <LandingHero cta={cta} />
      <main>
        <LandingFeaturesSection />
        <LandingStepRailSection />
        <LandingResearchBeamSection />
        <LandingChessSection cta={cta} />
        <LandingReverseChessSection cta={cta} />
        <LandingNumbersSection />
        <LandingTestimonialsSection />
        <LandingCtaFooterWrapper />
      </main>
    </div>
  )
}
