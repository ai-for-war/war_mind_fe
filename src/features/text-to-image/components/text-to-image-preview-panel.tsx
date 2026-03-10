import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { isAxiosError } from "axios"
import { useMemo, useState } from "react"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCancelImageGenerationJob, useImageGenerationDetail } from "@/features/text-to-image/hooks"
import { cn } from "@/lib/utils"

import type { TextToImageGenerationJobRecord } from "@/features/text-to-image/types"

interface TextToImagePreviewPanelProps {
  onGenerateAgain?: (job: TextToImageGenerationJobRecord) => void
  selectedJobId: string | null
}

const getAspectRatioValue = (aspectRatio: string): number => {
  const [width, height] = aspectRatio.split(":").map(Number)
  if (!width || !height) {
    return 1
  }

  return width / height
}

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date)
}

export const TextToImagePreviewPanel = ({
  onGenerateAgain,
  selectedJobId,
}: TextToImagePreviewPanelProps) => {
  const [isCopyingPrompt, setIsCopyingPrompt] = useState(false)
  const detailQuery = useImageGenerationDetail(selectedJobId)
  const cancelMutation = useCancelImageGenerationJob()
  const detail = detailQuery.data
  const job = detail?.job
  const outputImage = detail?.output_images[0]

  const stageRatio = useMemo(() => {
    if (!job?.aspect_ratio) {
      return 1
    }

    return getAspectRatioValue(job.aspect_ratio)
  }, [job?.aspect_ratio])

  const handleCopyPrompt = async (): Promise<void> => {
    if (!job?.prompt || typeof window === "undefined" || !navigator?.clipboard) {
      return
    }

    setIsCopyingPrompt(true)
    try {
      await navigator.clipboard.writeText(job.prompt)
    } finally {
      setIsCopyingPrompt(false)
    }
  }

  const handleGenerateAgain = (): void => {
    if (!job) {
      return
    }

    onGenerateAgain?.(job)
  }

  const getCancelErrorMessage = (): string => {
    if (!cancelMutation.error) {
      return ""
    }

    if (isAxiosError(cancelMutation.error)) {
      const responseMessage = cancelMutation.error.response?.data
      if (typeof responseMessage === "string" && responseMessage.trim().length > 0) {
        return responseMessage
      }

      if (
        responseMessage &&
        typeof responseMessage === "object" &&
        "detail" in responseMessage &&
        typeof responseMessage.detail === "string"
      ) {
        return responseMessage.detail
      }
    }

    if (cancelMutation.error instanceof Error && cancelMutation.error.message.trim().length > 0) {
      return cancelMutation.error.message
    }

    return "This job may already be processing and can no longer be cancelled."
  }

  const handleCancelJob = async (): Promise<void> => {
    if (!job || job.status !== "pending") {
      return
    }

    try {
      await cancelMutation.mutateAsync(job.id)
    } catch {
      await detailQuery.refetch()
    }
  }

  if (!selectedJobId) {
    return (
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-primary" />
            Preview
          </CardTitle>
          <CardDescription>
            Select a generation from history to see details and output.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Generated images will appear here after you create or select a job.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (detailQuery.isLoading || detailQuery.isFetching) {
    return (
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-primary" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Loading generation details...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (detailQuery.isError || !job) {
    return (
      <Card className="border-border/70 bg-card/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4 text-primary" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4" />
              Failed to load selected generation details.
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isPending = job.status === "pending"
  const isProcessing = job.status === "processing"
  const isSucceeded = job.status === "succeeded"
  const isFailed = job.status === "failed"
  const isCancelled = job.status === "cancelled"

  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="size-4 text-primary" />
          Generation preview
        </CardTitle>
        <CardDescription className="break-all">
          Job ID: <span className="font-mono text-xs">{job.id}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AspectRatio ratio={stageRatio}>
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-md border text-sm",
              isSucceeded && outputImage
                ? "border-border/70 bg-black"
                : "border-border/70 bg-muted/20 text-muted-foreground",
            )}
          >
            {isSucceeded && outputImage ? (
              <img
                src={outputImage.signed_url}
                alt={`Generated result for ${job.prompt}`}
                className="h-full w-full rounded-md object-cover"
              />
            ) : null}

            {isPending ? (
              <div className="text-center">
                <Clock3 className="mx-auto mb-2 size-5 text-amber-300" />
                <p>Queued for generation...</p>
              </div>
            ) : null}

            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 size-5 animate-spin text-sky-300" />
                <p>Generating your image...</p>
              </div>
            ) : null}

            {isSucceeded && !outputImage ? (
              <div className="text-center">
                <AlertCircle className="mx-auto mb-2 size-5 text-amber-300" />
                <p>No output image is available for this job.</p>
              </div>
            ) : null}

            {isFailed ? (
              <div className="text-center">
                <XCircle className="mx-auto mb-2 size-5 text-destructive" />
                <p>{job.error_message ?? "Generation failed. Please try again."}</p>
              </div>
            ) : null}

            {isCancelled ? (
              <div className="text-center">
                <AlertCircle className="mx-auto mb-2 size-5 text-zinc-300" />
                <p>This generation was cancelled before processing started.</p>
              </div>
            ) : null}
          </div>
        </AspectRatio>

        <div className="grid gap-2 rounded-md border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="font-medium text-foreground">Status:</span> {job.status}
          </p>
          <p>
            <span className="font-medium text-foreground">Aspect ratio:</span>{" "}
            {job.aspect_ratio}
          </p>
          <p>
            <span className="font-medium text-foreground">Requested:</span>{" "}
            {formatDateTime(job.requested_at)}
          </p>
          <p>
            <span className="font-medium text-foreground">Completed:</span>{" "}
            {formatDateTime(job.completed_at)}
          </p>
        </div>

        <div className="rounded-md border border-border/70 bg-muted/20 p-3">
          <p className="mb-1 text-xs font-medium text-foreground">Prompt</p>
          <p className="text-sm text-muted-foreground">{job.prompt}</p>
        </div>

        {isPending ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void handleCancelJob()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel job"
              )}
            </Button>
            {cancelMutation.error ? (
              <p role="alert" className="text-sm text-destructive">
                {getCancelErrorMessage()}
              </p>
            ) : null}
          </div>
        ) : null}

        {(isFailed || isCancelled) && !isPending ? (
          <Button type="button" variant="outline" className="w-full" onClick={handleGenerateAgain}>
            <RefreshCw className="size-4" />
            Generate again
          </Button>
        ) : null}

        {isSucceeded ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={!outputImage}
              onClick={() => {
                if (outputImage && typeof window !== "undefined") {
                  window.open(outputImage.signed_url, "_blank", "noopener,noreferrer")
                }
              }}
            >
              <ExternalLink className="size-4" />
              Open full size
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!outputImage}
              onClick={() => {
                if (!outputImage || typeof window === "undefined") {
                  return
                }

                const anchor = window.document.createElement("a")
                anchor.href = outputImage.signed_url
                anchor.download = `text-to-image-${job.id}.png`
                window.document.body.appendChild(anchor)
                anchor.click()
                window.document.body.removeChild(anchor)
              }}
            >
              <Download className="size-4" />
              Download
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleCopyPrompt()}>
              <Copy className="size-4" />
              {isCopyingPrompt ? "Copying..." : "Copy prompt"}
            </Button>
            <Button type="button" onClick={handleGenerateAgain}>
              <CheckCircle2 className="size-4" />
              Generate again
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
