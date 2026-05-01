import { useRef } from "react"
import { Bot, CalendarClock, CheckCircle2, Database, FileSearch } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { Badge } from "@/components/ui/badge"
import { landingWorkflowSteps } from "@/features/landing/landing.utils"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const workflowIcons = [Database, FileSearch, CalendarClock, Bot]

export const LandingWorkflowStory = () => {
  const sectionRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const scope = sectionRef.current

      if (!scope) {
        return
      }

      const matchMedia = gsap.matchMedia()

      matchMedia.add("(prefers-reduced-motion: no-preference)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".landing-story-panel", scope)
        const steps = gsap.utils.toArray<HTMLElement>(".landing-story-step", scope)

        gsap.from(panels, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            start: "top 72%",
            trigger: scope,
          },
          y: 56,
        })

        panels.forEach((panel, index) => {
          const meter = panel.querySelector<HTMLElement>(".landing-story-meter")

          ScrollTrigger.create({
            end: "bottom 42%",
            onToggle: (self) => {
              if (!self.isActive) {
                return
              }

              steps.forEach((step, stepIndex) => {
                step.toggleAttribute("data-active", stepIndex === index)
              })
            },
            start: "top 60%",
            trigger: panel,
          })

          if (meter) {
            gsap.fromTo(
              meter,
              { scaleX: 0 },
              {
                ease: "none",
                scaleX: 1,
                scrollTrigger: {
                  end: "bottom 45%",
                  scrub: 0.6,
                  start: "top 70%",
                  trigger: panel,
                },
                transformOrigin: "left center",
              },
            )
          }
        })
      })

      return () => {
        matchMedia.revert()
      }
    },
    { scope: sectionRef },
  )

  return (
    <section
      className="mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-28"
      id="workflow"
      ref={sectionRef}
    >
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Badge className="border-cyan-200/20 bg-cyan-200/10 text-cyan-100" variant="outline">
          Product flow
        </Badge>
        <div className="mt-5 flex max-w-xl flex-col gap-4">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            From ticker to agent-backed decision.
          </h2>
          <p className="text-base leading-7 text-zinc-400">
            The page sells the workflow already present in the app: browse the stock universe,
            generate sourced research, schedule recurring coverage, then ask Super-Agent to
            synthesize the work.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {landingWorkflowSteps.map((step, index) => {
            const Icon = workflowIcons[index]

            return (
              <div
                className="landing-story-step group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition-colors data-[active]:border-cyan-200/30 data-[active]:bg-cyan-200/10"
                key={step.id}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-950/60 text-zinc-300 group-data-[active]:border-cyan-200/30 group-data-[active]:text-cyan-100">
                  {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 group-data-[active]:text-cyan-100/70">
                    {step.eyebrow}
                  </span>
                  <span className="text-sm font-medium text-zinc-200 group-data-[active]:text-white">
                    {step.title}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {landingWorkflowSteps.map((step, index) => (
          <article
            className="landing-story-panel overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/70 shadow-[0_28px_80px_-50px_rgba(8,145,178,0.75)] backdrop-blur-xl"
            key={step.id}
          >
            <div className="h-1 origin-left bg-cyan-200 landing-story-meter" />
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-cyan-100">{String(index + 1).padStart(2, "0")}</span>
                  <Badge className="border-white/10 bg-white/5 text-zinc-200" variant="outline">
                    {step.accent}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
                  <p className="text-sm leading-6 text-zinc-400">{step.description}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {step.metric}
                  </span>
                  <CheckCircle2 className="size-4 text-emerald-200" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-200">{step.detail}</p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {["Input", "Runtime", "Output"].map((label) => (
                    <div
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-400"
                      key={label}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
