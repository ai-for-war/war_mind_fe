import { useEffect, useRef, useState, type RefObject } from "react"
import {
  BrainCircuit,
  ChartCandlestick,
  CheckCircle2,
  FileSearch,
  MousePointer2,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { AnimatedBeam } from "@/components/ui/animated-beam"
import { LandingSectionBadge } from "@/features/landing/components/landing-section-badge"
import {
  landingBeamPoints,
  landingBeamProviders,
  type LandingBeamProvider,
} from "@/features/landing/landing.utils"
import { cn } from "@/lib/utils"

const beamColor = "hsl(var(--landing-primary))"
const passiveBeamColor = "hsl(var(--landing-border))"
const edgeBeamProps = {
  fromAnchor: "edge",
  toAnchor: "edge",
} as const

type BeamNodeProps = {
  className?: string
  description: string
  eyebrow: string
  icon: LucideIcon
  nodeRef: RefObject<HTMLDivElement | null>
  title: string
  token?: string
}

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return prefersReducedMotion
}

const BeamNode = ({
  className,
  description,
  eyebrow,
  icon: Icon,
  nodeRef,
  title,
  token,
}: BeamNodeProps) => (
  <div className={cn("absolute w-36 xl:w-40", className)} ref={nodeRef}>
    <div className="liquid-glass rounded-2xl p-3.5 transition-colors hover:bg-white/[0.03]">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--landing-primary))]/10 text-[hsl(var(--landing-primary))]">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-normal text-[hsl(var(--landing-primary))]">
            {eyebrow}
          </p>
          <h3 className="text-base font-semibold leading-tight text-hero-heading">
            {title}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-hero-sub opacity-65">{description}</p>
      {token ? (
        <span className="mt-4 inline-flex rounded-full bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-hero-sub opacity-75">
          {token}
        </span>
      ) : null}
    </div>
  </div>
)

const ModelNode = ({
  className,
  nodeRef,
  provider,
}: {
  className?: string
  nodeRef: RefObject<HTMLDivElement | null>
  provider: LandingBeamProvider
}) => (
  <BeamNode
    className={className}
    description={provider.description}
    eyebrow="Model"
    icon={BrainCircuit}
    nodeRef={nodeRef}
    title={provider.name}
    token={provider.token}
  />
)

const MobileFlow = () => {
  const [openAiProvider, glmProvider, minimaxProvider] = landingBeamProviders
  const mobileItems = [
    {
      description: "Analyst starts with a market question, ticker, or watchlist.",
      eyebrow: "Input",
      icon: UserRound,
      title: "User",
    },
    {
      description: "Vietnam equity context, sector filters, and market movement.",
      eyebrow: "Market",
      icon: ChartCandlestick,
      title: "Vietnam stocks",
    },
    {
      description: `${openAiProvider.name}, ${glmProvider.name}, and ${minimaxProvider.name} support research synthesis.`,
      eyebrow: "Models",
      icon: BrainCircuit,
      title: "Model providers",
    },
    {
      description: "A sourced recap, risk checklist, and follow-up plan stay visible.",
      eyebrow: "Research",
      icon: FileSearch,
      title: "Research brief",
    },
    {
      description: "The user reviews the thesis and controls any brokerage action manually.",
      eyebrow: "Review",
      icon: MousePointer2,
      title: "Manual decision",
    },
  ] as const

  return (
    <div className="xl:hidden">
      <div className="liquid-glass rounded-[2rem] p-5">
        <div className="relative flex flex-col gap-4">
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-5 top-8 w-px bg-[hsl(var(--landing-primary))]/45"
          />
          {mobileItems.map((item) => (
            <div className="relative pl-12" key={item.title}>
              <span className="absolute left-0 top-4 flex size-10 items-center justify-center rounded-full bg-[hsl(var(--landing-background))]">
                <span className="flex size-8 items-center justify-center rounded-full bg-[hsl(var(--landing-primary))]/10 text-[hsl(var(--landing-primary))]">
                  <item.icon aria-hidden="true" className="size-4" />
                </span>
              </span>
              <div className="liquid-glass rounded-2xl p-4">
                <p className="text-xs font-medium uppercase tracking-normal text-[hsl(var(--landing-primary))]">
                  {item.eyebrow}
                </p>
                <h3 className="mt-1 text-base font-semibold text-hero-heading">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-hero-sub opacity-65">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const LandingResearchBeamSection = () => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const marketRef = useRef<HTMLDivElement>(null)
  const openAiRef = useRef<HTMLDivElement>(null)
  const glmRef = useRef<HTMLDivElement>(null)
  const minimaxRef = useRef<HTMLDivElement>(null)
  const researchRef = useRef<HTMLDivElement>(null)
  const decisionRef = useRef<HTMLDivElement>(null)
  const [openAiProvider, glmProvider, minimaxProvider] = landingBeamProviders

  return (
    <section className="px-4 py-32 sm:px-6" id="model-flow">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end" data-landing-reveal>
          <div className="flex flex-col items-start">
            <LandingSectionBadge label="Model Orchestration" value="Beam" />
            <h2 className="mt-6 text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
              <span className="block">From Vietnam Market Data</span>
              <span className="block">to Analyst Review</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-hero-sub opacity-75">
              Recap.ai can route a Vietnam stock question through market context, model
              reasoning, and a sourced brief. The product stops at review; buy and sell
              decisions stay user-controlled outside Recap.ai.
            </p>
          </div>

          <ul className="flex flex-col gap-4 lg:pb-2">
            {landingBeamPoints.map((item) => (
              <li className="flex items-center gap-3 text-sm text-hero-sub" key={item.label}>
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[hsl(var(--landing-primary))]"
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <MobileFlow />

        <div
          className="liquid-glass relative hidden min-h-[620px] overflow-hidden rounded-[2rem] p-6 xl:block"
          data-landing-panel
          ref={containerRef}
        >
          {!prefersReducedMotion ? (
            <>
              <AnimatedBeam
                containerRef={containerRef}
                curvature={0}
                duration={4.6}
                fromRef={userRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.22}
                toRef={marketRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={-140}
                delay={0.2}
                duration={4.8}
                fromRef={marketRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.18}
                toRef={openAiRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={0}
                delay={0.45}
                duration={4.9}
                fromRef={marketRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.18}
                toRef={glmRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={140}
                delay={0.7}
                duration={5}
                fromRef={marketRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.18}
                toRef={minimaxRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={140}
                delay={0.4}
                duration={4.6}
                fromRef={openAiRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.16}
                toRef={researchRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={0}
                delay={0.65}
                duration={4.7}
                fromRef={glmRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.16}
                toRef={researchRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={-140}
                delay={0.9}
                duration={4.9}
                fromRef={minimaxRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.16}
                toRef={researchRef}
              />
              <AnimatedBeam
                containerRef={containerRef}
                curvature={0}
                delay={1.05}
                duration={4.8}
                fromRef={researchRef}
                {...edgeBeamProps}
                gradientStartColor={beamColor}
                gradientStopColor={beamColor}
                pathColor={passiveBeamColor}
                pathOpacity={0.2}
                toRef={decisionRef}
              />
            </>
          ) : null}

          <BeamNode
            className="left-6 top-[42%]"
            description="Question, ticker set, or watchlist."
            eyebrow="Input"
            icon={UserRound}
            nodeRef={userRef}
            title="User"
          />
          <BeamNode
            className="left-[22%] top-[42%]"
            description="Vietnam equities, sectors, and market context."
            eyebrow="Market"
            icon={ChartCandlestick}
            nodeRef={marketRef}
            title="Vietnam stocks"
          />
          <ModelNode className="left-[44%] top-8" nodeRef={openAiRef} provider={openAiProvider} />
          <ModelNode className="left-[44%] top-[39%]" nodeRef={glmRef} provider={glmProvider} />
          <ModelNode
            className="bottom-8 left-[44%]"
            nodeRef={minimaxRef}
            provider={minimaxProvider}
          />
          <BeamNode
            className="left-[66%] top-[42%] w-40 xl:w-44"
            description="Recap, sources, risk assumptions, and follow-up questions."
            eyebrow="Research"
            icon={FileSearch}
            nodeRef={researchRef}
            title="Research brief"
          />
          <BeamNode
            className="right-6 top-[42%] w-40 xl:w-44"
            description="User reviews the thesis and acts manually outside Recap.ai."
            eyebrow="Review"
            icon={MousePointer2}
            nodeRef={decisionRef}
            title="Manual decision"
          />
        </div>
      </div>
    </section>
  )
}
