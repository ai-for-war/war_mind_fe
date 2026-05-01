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

export type LandingStep = {
  description: string
  eyebrow: string
  metric: string
  title: string
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
  primaryHref: isAuthenticated ? "/stocks/research" : "#request-access",
  primaryLabel: isAuthenticated ? "Open AI Stock Analyst" : "Request access",
  secondaryHref: isAuthenticated ? "/super-agent" : "#request-access",
  secondaryLabel: isAuthenticated ? "Ask Super-Agent" : "Request access",
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
      "Screen Vietnamese equities by ticker, sector, exchange, and research intent before sending the best candidates into an agent run.",
    eyebrow: "Vietnam Market",
    stat: "VN",
    statLabel: "equity coverage focus",
    title: "Vietnam Stock Radar",
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
      "Turn important symbols into watchlists, then keep recurring briefs close to backtest context and market movement.",
    eyebrow: "Watchlists",
    stat: "Loop",
    statLabel: "watch, brief, backtest",
    title: "Watchlist-to-Backtest Loop",
  },
  {
    description:
      "Run Super-Agent conversations with visible planning, tool activity, and task state instead of opaque one-shot answers.",
    eyebrow: "Agent",
    stat: "Plan",
    statLabel: "visible before execution",
    title: "Guardrailed Agent Runs",
  },
  {
    description:
      "Force every thesis through risk prompts: liquidity, catalyst quality, time horizon, downside level, and source confidence.",
    eyebrow: "Risk",
    stat: "Checklist",
    statLabel: "before every thesis",
    title: "Risk-Aware Decision Notes",
  },
]

export const landingRoutingBullets: LandingRoutingBullet[] = [
  { label: "AI-scored Vietnam stock research requests" },
  { label: "Risk-reviewed market notes with source context" },
  { label: "Dynamic handoff into stock, report, or schedule routes" },
  { label: "Multi-step Super-Agent planning with visible progress" },
]

export const landingPipelineStats: LandingPipelineStat[] = [
  { metric: "5+", label: "stock surfaces connected" },
  { metric: "15m", label: "fastest recurring cadence" },
  { metric: "VN", label: "market research focus" },
  { metric: "Plan", label: "agent research model" },
  { metric: "Live", label: "streamed research status" },
  { metric: "Risk", label: "thesis checklist" },
]

export const landingSteps: LandingStep[] = [
  {
    description:
      "Start with Vietnam tickers, sectors, exchange filters, and the specific market question the analyst wants answered.",
    eyebrow: "Step 01",
    metric: "VN scan",
    title: "Map the market surface",
  },
  {
    description:
      "Generate a sourced recap that separates price movement, company context, catalyst notes, and unresolved assumptions.",
    eyebrow: "Step 02",
    metric: "Sources",
    title: "Build the research brief",
  },
  {
    description:
      "Pin important symbols into watchlists and turn one-off coverage into daily, weekly, or high-frequency monitoring.",
    eyebrow: "Step 03",
    metric: "15m",
    title: "Schedule recurring coverage",
  },
  {
    description:
      "Ask Super-Agent to form a visible plan, choose the next route, and keep the work traceable while it runs.",
    eyebrow: "Step 04",
    metric: "Plan",
    title: "Escalate to agent workflow",
  },
  {
    description:
      "Close every research loop with a risk note: liquidity, confidence, time horizon, downside level, and follow-up trigger.",
    eyebrow: "Step 05",
    metric: "Risk",
    title: "Review before acting",
  },
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
    links: [
      "Vietnam stock radar",
      "Schedules",
      "Watchlists",
      "Backtests",
      "Super-Agent",
    ],
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
