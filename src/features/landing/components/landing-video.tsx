import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type LandingLocalVideoProps = {
  className?: string
  loadStrategy?: VideoLoadStrategy
  mp4Src: string
  rootMargin?: string
  webmSrc: string
}

type VideoLoadStrategy = "eager" | "lazy"

const DEFAULT_ROOT_MARGIN = "900px 0px"

const useDeferredVideoLoad = (
  loadStrategy: VideoLoadStrategy,
  rootMargin: string,
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(loadStrategy === "eager")

  useEffect(() => {
    if (shouldLoad || loadStrategy === "eager") {
      return
    }

    const container = containerRef.current

    if (!container || !("IntersectionObserver" in window)) {
      const fallbackTimer = window.setTimeout(() => setShouldLoad(true), 0)

      return () => {
        window.clearTimeout(fallbackTimer)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (!entry?.isIntersecting) {
          return
        }

        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin, threshold: 0.01 },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [loadStrategy, rootMargin, shouldLoad])

  return { containerRef, shouldLoad }
}

export const LandingLocalVideo = ({
  className,
  loadStrategy = "lazy",
  mp4Src,
  rootMargin = DEFAULT_ROOT_MARGIN,
  webmSrc,
}: LandingLocalVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { containerRef, shouldLoad } = useDeferredVideoLoad(loadStrategy, rootMargin)

  useEffect(() => {
    if (!shouldLoad) {
      return
    }

    const video = videoRef.current

    if (!video) {
      return
    }

    const playVideo = () => {
      const playPromise = video.play()

      if (playPromise) {
        void playPromise.catch(() => undefined)
      }
    }

    video.load()
    video.addEventListener("loadedmetadata", playVideo, { once: true })
    playVideo()

    return () => {
      video.removeEventListener("loadedmetadata", playVideo)
    }
  }, [shouldLoad])

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative size-full overflow-hidden bg-[hsl(var(--landing-card))]",
        className,
      )}
      ref={containerRef}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--landing-primary)/0.12),transparent_34%),linear-gradient(135deg,hsl(var(--landing-secondary)/0.55),hsl(var(--landing-background)))]" />
      <video
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
        preload={shouldLoad ? "metadata" : "none"}
        ref={videoRef}
      >
        {shouldLoad ? (
          <>
            <source src={webmSrc} type="video/webm" />
            <source src={mp4Src} type="video/mp4" />
          </>
        ) : null}
      </video>
    </div>
  )
}
