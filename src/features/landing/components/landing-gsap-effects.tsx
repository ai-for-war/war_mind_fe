import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect } from "react"

gsap.registerPlugin(ScrollTrigger)

export const LandingGsapEffects = () => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      return
    }

    const context = gsap.context(() => {
      gsap.from("[data-landing-nav]", {
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        y: -18,
      })

      gsap.from(
        [
          "[data-landing-hero='badge']",
          "[data-landing-hero='title']",
          "[data-landing-hero='copy']",
          "[data-landing-hero='actions']",
          "[data-landing-hero='marquee']",
        ].join(", "),
        {
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          y: 28,
        },
      )

      gsap.utils.toArray<HTMLElement>("[data-landing-reveal]").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            once: true,
            start: "top 82%",
            trigger: element,
          },
          y: 42,
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-landing-card-group]").forEach((group) => {
        const cards = group.querySelectorAll("[data-landing-card]")

        if (cards.length === 0) {
          return
        }

        gsap.from(cards, {
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            once: true,
            start: "top 80%",
            trigger: group,
          },
          stagger: 0.08,
          y: 34,
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-landing-step-rail]").forEach((rail) => {
        const line = rail.querySelector("[data-landing-step-line]")
        const steps = rail.querySelectorAll("[data-landing-step]")

        if (line) {
          gsap.fromTo(
            line,
            { scaleY: 0 },
            {
              ease: "none",
              scaleY: 1,
              scrollTrigger: {
                end: "bottom 42%",
                scrub: 0.35,
                start: "top 68%",
                trigger: rail,
              },
            },
          )
        }

        if (steps.length === 0) {
          return
        }

        gsap.from(steps, {
          autoAlpha: 0,
          duration: 0.72,
          ease: "power3.out",
          scrollTrigger: {
            once: true,
            start: "top 74%",
            trigger: rail,
          },
          stagger: 0.12,
          x: 32,
        })
      })

      gsap.utils.toArray<HTMLElement>("[data-landing-panel]").forEach((panel) => {
        gsap.fromTo(
          panel,
          { yPercent: 5 },
          {
            ease: "none",
            scrollTrigger: {
              end: "bottom top",
              scrub: 0.6,
              start: "top bottom",
              trigger: panel,
            },
            yPercent: -5,
          },
        )
      })
    })

    return () => {
      context.revert()
    }
  }, [])

  return null
}
