import { Bot, CheckCircle2, Database, FileText, Play, Radio, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const previewStocks = [
  { symbol: "FPT", label: "Technology", value: "+1.7%" },
  { symbol: "VCB", label: "Banking", value: "+0.8%" },
  { symbol: "MWG", label: "Retail", value: "-0.6%" },
]

const planSteps = [
  { label: "Load company context", status: "completed" },
  { label: "Compare recent catalysts", status: "active" },
  { label: "Draft sourced brief", status: "pending" },
]

export const LandingProductPreview = () => (
  <div className="landing-hero-preview relative mx-auto w-full max-w-2xl">
    <div className="absolute -left-4 top-10 hidden w-44 rotate-[-4deg] rounded-2xl border border-white/10 bg-white/10 p-3 text-xs text-zinc-100 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl sm:block">
      <div className="flex items-center gap-2">
        <Radio className="size-3.5 text-cyan-200" aria-hidden="true" />
        <span className="font-medium">Schedule active</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-zinc-300">
        <span>Daily</span>
        <span>08:00</span>
      </div>
    </div>

    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3 shadow-[0_30px_90px_-45px_rgba(8,145,178,0.75)] backdrop-blur-2xl">
      <div className="rounded-[1.45rem] border border-white/10 bg-zinc-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-200" />
            <span className="size-2 rounded-full bg-emerald-200/80" />
            <span className="size-2 rounded-full bg-zinc-500" />
          </div>
          <Badge variant="outline" className="border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
            AI Stock Analyst
          </Badge>
        </div>

        <div className="grid gap-3 p-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Search className="size-4 text-cyan-200" aria-hidden="true" />
                Market catalog
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {previewStocks.map((stock) => (
                  <div
                    className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2"
                    key={stock.symbol}
                  >
                    <span className="font-mono text-sm text-white">{stock.symbol}</span>
                    <span className="truncate text-xs text-zinc-400">{stock.label}</span>
                    <span
                      className={cn(
                        "font-mono text-xs",
                        stock.value.startsWith("+") ? "text-emerald-200" : "text-rose-200",
                      )}
                    >
                      {stock.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Database className="size-4 text-cyan-200" aria-hidden="true" />
                Report sources
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Company news", "Price history", "Ratio summary", "Events"].map((source) => (
                  <Badge
                    className="border-white/10 bg-white/5 text-zinc-200"
                    key={source}
                    variant="outline"
                  >
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">
                    Research run
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-white">
                    VCI deep brief
                  </span>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-200/10">
                  <Play className="size-4 fill-cyan-100 text-cyan-100" aria-hidden="true" />
                </span>
              </div>

              <svg
                aria-hidden="true"
                className="mt-5 h-24 w-full overflow-visible"
                viewBox="0 0 320 112"
              >
                <path
                  d="M4 92 C 54 82, 64 42, 106 55 C 143 67, 147 26, 186 31 C 233 37, 232 81, 316 18"
                  className="landing-chart-line"
                  fill="none"
                  pathLength="1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <path
                  d="M4 92 C 54 82, 64 42, 106 55 C 143 67, 147 26, 186 31 C 233 37, 232 81, 316 18"
                  fill="none"
                  opacity="0.14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="12"
                />
              </svg>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                  <Bot className="size-4 text-cyan-200" aria-hidden="true" />
                  Super-Agent plan
                </div>
                <Badge className="border-emerald-200/20 bg-emerald-200/10 text-emerald-100" variant="outline">
                  Subagent
                </Badge>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {planSteps.map((step) => (
                  <div
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                    key={step.label}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="size-4 text-emerald-200" aria-hidden="true" />
                    ) : (
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          step.status === "active"
                            ? "bg-cyan-200 shadow-[0_0_0_6px_rgba(103,232,249,0.12)]"
                            : "bg-zinc-600",
                        )}
                      />
                    )}
                    <span className="text-sm text-zinc-200">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <FileText className="size-3.5 text-cyan-200" aria-hidden="true" />
            Sourced report, recurring schedule, and agent reasoning share one workspace.
          </div>
        </div>
      </div>
    </div>
  </div>
)
