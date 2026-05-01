export type LandingCtaConfig = {
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}

export type LandingTicker = {
  name: string
  token: string
}

export type LandingFeatureCard = {
  description: string
  eyebrow: string
  stat: string
  statLabel: string
  title: string
}

export type LandingRoutingBullet = {
  label: string
}

export type LandingPipelineStat = {
  label: string
  metric: string
}

export type LandingTestimonial = {
  initials: string
  name: string
  quote: string
  role: string
}

export type LandingFooterGroup = {
  links: string[]
  title: string
}

export const getLandingCtaConfig = (isAuthenticated: boolean): LandingCtaConfig => ({
  primaryHref: isAuthenticated ? "/stocks/research" : "/login",
  primaryLabel: isAuthenticated ? "Open AI Stock Analyst" : "Enter workspace",
  secondaryHref: isAuthenticated ? "/super-agent" : "/login",
  secondaryLabel: isAuthenticated ? "Ask Super-Agent" : "View product flow",
})

export const landingTickers: LandingTicker[] = [
  { name: "Vortex", token: "V" },
  { name: "Nimbus", token: "N" },
  { name: "Prysma", token: "P" },
  { name: "Cirrus", token: "C" },
  { name: "Kynder", token: "K" },
  { name: "Halcyn", token: "H" },
]

export const landingFeatureCards: LandingFeatureCard[] = [
  {
    description:
      "Convert symbol discovery, AI reports, and recurring coverage into a single research loop that stays close to supported app routes.",
    eyebrow: "Workflow",
    stat: "15m",
    statLabel: "minimum research cadence",
    title: "Lightning Research Workflows",
  },
  {
    description:
      "Move from watchlists into sourced briefs and market context without losing the audit trail behind each conclusion.",
    eyebrow: "Analytics",
    stat: "Source-led",
    statLabel: "report interpretation",
    title: "Deep-Dive Market Analytics",
  },
  {
    description:
      "Run Super-Agent conversations with visible planning, tool activity, and task state instead of opaque one-shot answers.",
    eyebrow: "Agent",
    stat: "Plan",
    statLabel: "visible before execution",
    title: "Guardrailed Agent Runs",
  },
]

export const landingRoutingBullets: LandingRoutingBullet[] = [
  { label: "AI-scored market research requests" },
  { label: "Dynamic handoff into stock, report, or schedule routes" },
  { label: "Multi-step Super-Agent planning with visible progress" },
]

export const landingPipelineStats: LandingPipelineStat[] = [
  { metric: "5+", label: "stock surfaces connected" },
  { metric: "15m", label: "fastest recurring cadence" },
  { metric: "Plan", label: "agent execution model" },
  { metric: "Live", label: "streamed research status" },
]

export const landingTestimonials: LandingTestimonial[] = [
  {
    initials: "MW",
    name: "Mara Whitfield",
    quote:
      "The product feels strongest when it treats research as an operating rhythm, not a static report download.",
    role: "Portfolio Research Lead",
  },
  {
    initials: "DT",
    name: "Derek Tanaka",
    quote:
      "The Super-Agent pattern makes the reasoning path inspectable enough for analysts to challenge it before acting.",
    role: "Quant Strategy Operator",
  },
  {
    initials: "SR",
    name: "Simone Reuter",
    quote:
      "Recurring stock coverage is the right wedge: it gives the team a repeatable market briefing without adding another dashboard habit.",
    role: "Market Intelligence Director",
  },
]

export const landingFooterGroups: LandingFooterGroup[] = [
  {
    title: "Product",
    links: ["Stock research", "Schedules", "Watchlists", "Backtests", "Super-Agent"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Press"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Community", "Support", "Status"],
  },
]
