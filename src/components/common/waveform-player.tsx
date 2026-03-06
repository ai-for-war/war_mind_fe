import { useWavesurfer } from "@wavesurfer/react"
import { Pause, Play } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const DEFAULT_WAVE_COLOR = "#404040"
const DEFAULT_PROGRESS_COLOR = "#f59e0b"

export type WaveformPlayerProps = {
  src?: string
  variant?: "default" | "compact"
  waveColor?: string
  progressColor?: string
  height?: number
  className?: string
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const minutes = Math.floor(safeSeconds / 60)
  const remaining = safeSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`
}

export function WaveformPlayer({
  src,
  variant = "default",
  waveColor = DEFAULT_WAVE_COLOR,
  progressColor = DEFAULT_PROGRESS_COLOR,
  height,
  className,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const resolvedHeight = useMemo(() => {
    if (typeof height === "number") return height
    return variant === "compact" ? 32 : 48
  }, [height, variant])

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: src,
    waveColor,
    progressColor,
    cursorColor: progressColor,
    height: resolvedHeight,
    barWidth: 2,
    barGap: 2,
    barRadius: 2,
    normalize: true,
    dragToSeek: true,
  })

  useEffect(() => {
    return () => {
      if (!wavesurfer) return
      try {
        wavesurfer.destroy()
      } catch {
        // Ignore cleanup errors from already-destroyed instances.
      }
    }
  }, [wavesurfer])

  const duration = wavesurfer?.getDuration() ?? 0
  const canPlay = Boolean(src) && isReady

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground",
          className
        )}
      >
        No audio source
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size={variant === "compact" ? "icon-xs" : "icon-sm"}
          onClick={() => void wavesurfer?.playPause()}
          disabled={!canPlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <div className="min-w-0 flex-1">
          {!isReady ? (
            <Skeleton className={cn("w-full rounded-md", variant === "compact" ? "h-8" : "h-12")} />
          ) : null}
          <div
            ref={containerRef}
            className={cn("w-full", !isReady && "pointer-events-none opacity-0")}
          />
        </div>
      </div>
      {variant === "default" ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      ) : null}
    </div>
  )
}
