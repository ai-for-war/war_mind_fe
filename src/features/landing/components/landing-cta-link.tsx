import type { ComponentProps, MouseEvent } from "react"
import { forwardRef } from "react"
import { Link } from "react-router-dom"

type LandingCtaLinkProps = Omit<ComponentProps<"a">, "href"> & {
  to: string
}

const handleHashLinkClick = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
  const targetElement = document.querySelector(target)

  if (!targetElement) {
    return
  }

  event.preventDefault()

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  targetElement.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  })

  window.history.pushState(null, "", target)
}

export const LandingCtaLink = forwardRef<HTMLAnchorElement, LandingCtaLinkProps>(
  ({ onClick, to, ...props }, ref) => {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || !to.startsWith("#")) {
        return
      }

      handleHashLinkClick(event, to)
    }

    if (to.startsWith("#")) {
      return <a href={to} onClick={handleClick} ref={ref} {...props} />
    }

    return <Link onClick={onClick} ref={ref} to={to} {...props} />
  },
)

LandingCtaLink.displayName = "LandingCtaLink"
