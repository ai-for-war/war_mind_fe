export type LandingCtaConfig = {
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
}

export type LandingTicker = {
  change: string
  name: string
  symbol: string
  tone: "positive" | "negative" | "neutral"
}

export type LandingWorkflowStep = {
  accent: string
  description: string
  detail: string
  eyebrow: string
  id: string
  metric: string
  title: string
}

export type LandingFeature = {
  description: string
  icon: "bot" | "calendar" | "chart" | "database" | "layers" | "shield"
  kicker: string
  title: string
}

export const getLandingCtaConfig = (isAuthenticated: boolean): LandingCtaConfig => ({
  primaryHref: isAuthenticated ? "/stocks/research" : "/login",
  primaryLabel: isAuthenticated ? "Open AI Stock Analyst" : "Enter workspace",
  secondaryHref: isAuthenticated ? "/super-agent" : "/login",
  secondaryLabel: isAuthenticated ? "Ask Super-Agent" : "View product flow",
})

export const landingTickers: LandingTicker[] = [
  { symbol: "FPT", name: "Technology", change: "+1.7%", tone: "positive" },
  { symbol: "VCB", name: "Banking", change: "+0.8%", tone: "positive" },
  { symbol: "MWG", name: "Retail", change: "-0.6%", tone: "negative" },
  { symbol: "GAS", name: "Energy", change: "+1.1%", tone: "positive" },
  { symbol: "HPG", name: "Materials", change: "-0.3%", tone: "negative" },
  { symbol: "VNM", name: "Consumer", change: "+0.4%", tone: "positive" },
]

export const landingWorkflowSteps: LandingWorkflowStep[] = [
  {
    accent: "Catalog",
    description:
      "Search persisted market symbols, open company context, and move directly into research, watchlists, or backtests.",
    detail: "Search, exchange filters, company overview, price history",
    eyebrow: "Step 01",
    id: "catalog",
    metric: "Market map",
    title: "Start from the stock universe",
  },
  {
    accent: "Research",
    description:
      "Queue an AI stock report, keep the runtime visible, and read conclusions beside the sources that shaped them.",
    detail: "Reports, runtime config, citations, completion state",
    eyebrow: "Step 02",
    id: "research",
    metric: "Evidence first",
    title: "Turn symbols into sourced briefs",
  },
  {
    accent: "Schedules",
    description:
      "Convert a one-off question into recurring coverage with supported cadences for daily, weekly, or frequent monitoring.",
    detail: "Every 15 minutes, daily, weekly, pause, resume",
    eyebrow: "Step 03",
    id: "schedules",
    metric: "Always watching",
    title: "Let the analyst keep working",
  },
  {
    accent: "Super-Agent",
    description:
      "Ask the lead agent to synthesize the market context, follow a visible plan, and call tools without hiding the work.",
    detail: "Conversation rail, subagent toggle, plan dock, streaming output",
    eyebrow: "Step 04",
    id: "super-agent",
    metric: "Plan visible",
    title: "Escalate decisions to an agent workspace",
  },
]

export const landingFeatures: LandingFeature[] = [
  {
    description:
      "The landing experience points to existing stock, research, schedule, watchlist, backtest, and agent routes instead of promising unsupported tools.",
    icon: "database",
    kicker: "Grounded surface",
    title: "Built from current product contracts",
  },
  {
    description:
      "The hero preview shows the exact mental model users meet in-app: market rows, a sourced report, and a plan-driven agent run.",
    icon: "layers",
    kicker: "Product-first visual",
    title: "No abstract AI theatre",
  },
  {
    description:
      "Scroll animation is reserved for the workflow story. UI details use lighter CSS motion so the page stays fast on normal laptops.",
    icon: "chart",
    kicker: "Motion budget",
    title: "Animation with a job",
  },
  {
    description:
      "The Super-Agent section highlights runtime selection, subagent mode, and plan progress so the user can judge how work is being done.",
    icon: "bot",
    kicker: "Traceable agency",
    title: "Agent work remains inspectable",
  },
  {
    description:
      "Research scheduling mirrors the supported backend cadences and avoids invented alerting, trading, or portfolio automation claims.",
    icon: "calendar",
    kicker: "Recurring coverage",
    title: "Schedules stay honest",
  },
  {
    description:
      "Animations reduce to static or opacity-based states under OS reduced-motion preferences.",
    icon: "shield",
    kicker: "Accessibility",
    title: "Motion respects user settings",
  },
]
