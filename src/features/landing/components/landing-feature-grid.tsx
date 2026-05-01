import {
  Bot,
  CalendarClock,
  ChartSpline,
  Database,
  Layers3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { landingFeatures, type LandingFeature } from "@/features/landing/landing.utils"
import { cn } from "@/lib/utils"

const featureIconMap: Record<LandingFeature["icon"], LucideIcon> = {
  bot: Bot,
  calendar: CalendarClock,
  chart: ChartSpline,
  database: Database,
  layers: Layers3,
  shield: ShieldCheck,
}

export const LandingFeatureGrid = () => (
  <section className="mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28" id="systems">
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="flex max-w-xl flex-col gap-5">
        <Badge className="w-fit border-cyan-200/20 bg-cyan-200/10 text-cyan-100" variant="outline">
          System design
        </Badge>
        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          A landing page that behaves like the product.
        </h2>
        <p className="text-base leading-7 text-zinc-400">
          The strongest first impression is not a slogan. It is a compressed version of the
          operating loop users will run every day.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {landingFeatures.map((feature, index) => {
          const Icon = featureIconMap[feature.icon]

          return (
            <article
              className={cn(
                "group rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-cyan-200/25 hover:bg-cyan-200/[0.07]",
                index === 0 && "md:col-span-4",
                index === 1 && "md:col-span-2",
                index === 2 && "md:col-span-3",
                index === 3 && "md:col-span-3",
                index === 4 && "md:col-span-2",
                index === 5 && "md:col-span-4",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/50 text-cyan-100 transition-transform group-hover:-translate-y-0.5">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {feature.kicker}
                </span>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <h3 className="text-xl font-semibold tracking-tight text-white">{feature.title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{feature.description}</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)
