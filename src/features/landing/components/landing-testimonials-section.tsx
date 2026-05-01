import { cn } from "@/lib/utils"
import { landingTestimonials } from "@/features/landing/landing.utils"

export const LandingTestimonialsSection = () => (
  <section className="px-4 py-32 sm:px-6">
    <div className="mx-auto flex max-w-6xl flex-col gap-16">
      <div className="mx-auto max-w-3xl text-center" data-landing-reveal>
        <h2 className="text-3xl font-semibold leading-[1.06] tracking-normal text-hero-heading sm:text-5xl">
          <span className="block">Designed for Research</span>
          <span className="block">Leaders Everywhere</span>
        </h2>
        <p className="mt-4 text-base text-hero-sub opacity-70">
          Notes from the operating model this landing page is selling.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3" data-landing-card-group>
        {landingTestimonials.map((testimonial, index) => (
          <article
            className={cn(
              "liquid-glass rounded-3xl p-8",
              index === 1 ? "md:-translate-y-6" : "",
            )}
            data-landing-card
            key={testimonial.name}
          >
            <p className="text-base leading-7 text-hero-sub opacity-85">"{testimonial.quote}"</p>
            <div className="mt-8 border-t border-[hsl(var(--landing-border))]/50 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--landing-secondary))] text-sm font-semibold text-[hsl(var(--landing-primary))]">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-hero-heading">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-hero-sub opacity-55">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)
