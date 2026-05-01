import { landingTickers } from "@/features/landing/landing.utils"
import { cn } from "@/lib/utils"

const tickerItems = [...landingTickers, ...landingTickers]

export const LandingMarketTicker = () => (
  <section aria-label="Illustrative market stream" className="border-y border-white/10 bg-zinc-950/70">
    <div className="mx-auto flex w-full max-w-[1400px] items-center gap-5 overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="hidden shrink-0 text-xs uppercase tracking-[0.22em] text-cyan-100/60 sm:block">
        Demo market stream
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="landing-market-marquee flex w-max items-center gap-3">
          {tickerItems.map((item, index) => (
            <div
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm"
              key={`${item.symbol}-${index}`}
            >
              <span className="font-mono font-medium text-white">{item.symbol}</span>
              <span className="text-zinc-500">{item.name}</span>
              <span
                className={cn(
                  "font-mono",
                  item.tone === "positive" && "text-emerald-200",
                  item.tone === "negative" && "text-rose-200",
                  item.tone === "neutral" && "text-zinc-300",
                )}
              >
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)
