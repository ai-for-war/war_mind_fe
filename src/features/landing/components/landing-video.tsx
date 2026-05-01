import Hls from "hls.js"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type LandingHlsVideoProps = {
  className?: string
  loadStrategy?: "eager" | "lazy"
  rootMargin?: string
  src: string
}

const DEFAULT_ROOT_MARGIN = "900px 0px"

export const LandingHlsVideo = ({
  className,
  loadStrategy = "lazy",
  rootMargin = DEFAULT_ROOT_MARGIN,
  src,
}: LandingHlsVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
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

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
      video.addEventListener("loadedmetadata", playVideo, { once: true })

      return () => {
        video.removeEventListener("loadedmetadata", playVideo)
        video.removeAttribute("src")
        video.load()
      }
    }

    if (!Hls.isSupported()) {
      return
    }

    const hls = new Hls({
      autoStartLoad: true,
      backBufferLength: 0,
      capLevelToPlayerSize: true,
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 8,
      maxMaxBufferLength: 16,
      startLevel: 0,
    })

    hls.loadSource(src)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, playVideo)

    return () => {
      hls.destroy()
      video.removeAttribute("src")
      video.load()
    }
  }, [shouldLoad, src])

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
        preload={shouldLoad ? "auto" : "none"}
        ref={videoRef}
      />
    </div>
  )
}
