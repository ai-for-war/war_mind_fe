import Hls from "hls.js"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

type LandingHlsVideoProps = {
  className?: string
  src: string
}

export const LandingHlsVideo = ({ className, src }: LandingHlsVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
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
      enableWorker: true,
      lowLatencyMode: false,
    })

    hls.loadSource(src)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, playVideo)

    return () => {
      hls.destroy()
      video.removeAttribute("src")
      video.load()
    }
  }, [src])

  return (
    <video
      aria-hidden="true"
      autoPlay
      className={cn("size-full object-cover", className)}
      loop
      muted
      playsInline
      ref={videoRef}
    />
  )
}
