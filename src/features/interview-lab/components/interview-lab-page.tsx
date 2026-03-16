import {
  AlertCircle,
  AudioLines,
  CheckCircle2,
  LoaderCircle,
  Mic,
  RefreshCcw,
  Share2,
  Square,
  Waves,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useInterviewSessionController } from "@/features/interview-lab/hooks"

const readinessItemMetadata = {
  interviewer: {
    description: "Google Meet tab audio",
    icon: Share2,
    title: "Interviewer lane",
  },
  user: {
    description: "Microphone input",
    icon: Mic,
    title: "User lane",
  },
} as const

const statusLabels = {
  completed: "Completed",
  failed: "Failed",
  finalizing: "Finalizing",
  idle: "Idle",
  media_ready: "Media Ready",
  preparing_media: "Preparing Media",
  starting: "Starting",
  stopped: "Stopped",
  stopping: "Stopping",
  streaming: "Streaming",
} as const

const readinessLabels = {
  ended: "Ended",
  failed: "Failed",
  idle: "Idle",
  ready: "Ready",
  requesting: "Requesting",
} as const

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Not available"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value))
}

const getStatusBadgeVariant = (
  status: keyof typeof statusLabels,
): "default" | "destructive" | "outline" | "secondary" => {
  if (status === "failed") {
    return "destructive"
  }

  if (status === "streaming") {
    return "default"
  }

  if (status === "completed" || status === "stopped") {
    return "secondary"
  }

  return "outline"
}

export const InterviewLabPage = () => {
  const {
    acceptedConfig,
    aiAnswers,
    canReset,
    canStart,
    canStop,
    closedUtterances,
    error,
    identifiers,
    lastEventAt,
    openUtterances,
    sourceReadiness,
    startInterviewSession,
    status,
    stopInterviewSession,
    resetInterviewSession,
    terminalReason,
  } = useInterviewSessionController()

  const interviewerClosedUtterances = closedUtterances.filter(
    (utterance) => utterance.source === "interviewer",
  )

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status)}>{statusLabels[status]}</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground">
              {terminalReason ? `Terminal: ${terminalReason}` : "Runtime host active"}
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
              Interview Lab
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Start a Chromium-only interview runtime, stream separate interviewer and user
              audio lanes, and inspect normalized transcript plus answer state in real time.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => void startInterviewSession()}
            disabled={!canStart}
          >
            <AudioLines className="size-4" />
            Start Session
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void stopInterviewSession()}
            disabled={!canStop}
          >
            <Square className="size-4" />
            Stop
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void resetInterviewSession()}
            disabled={!canReset}
          >
            <RefreshCcw className="size-4" />
            Reset
          </Button>
        </div>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{error.code}</AlertTitle>
          <AlertDescription>
            <p>{error.message}</p>
            <p>
              Source: {error.source} | Retryable: {error.retryable ? "Yes" : "No"}
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>Session Control Plane</CardTitle>
            <CardDescription>
              The page reads normalized runtime state from the interview store and keeps the
              controller lifecycle bound to this browser tab instance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Conversation ID
                </p>
                <p className="mt-2 break-all text-sm text-foreground">
                  {identifiers?.conversationId ?? "Awaiting session start"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Stream ID
                </p>
                <p className="mt-2 break-all text-sm text-foreground">
                  {identifiers?.streamId ?? "Awaiting session start"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Session status
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{statusLabels[status]}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Last event
                </p>
                <p className="mt-2 text-sm text-foreground">{formatDateTime(lastEventAt)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Audio contract
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {acceptedConfig
                    ? `${acceptedConfig.encoding} · ${acceptedConfig.sampleRate}Hz · ${acceptedConfig.channels}ch`
                    : "Awaiting stt:started"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(["interviewer", "user"] as const).map((role) => {
                const metadata = readinessItemMetadata[role]
                const readiness = sourceReadiness[role]

                return (
                  <div
                    key={role}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{metadata.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{metadata.description}</p>
                      </div>
                      <Badge
                        variant={readiness.isReady ? "secondary" : "outline"}
                        className="shrink-0"
                      >
                        {readinessLabels[readiness.status]}
                      </Badge>
                    </div>
                    {readiness.error ? (
                      <p className="mt-3 text-sm text-destructive">{readiness.error}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>Open Utterances</CardTitle>
            <CardDescription>
              Partial and stable fragments stay in open utterance state until the backend emits
              the authoritative <code>stt:utterance_closed</code> event.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["interviewer", "user"] as const).map((role) => {
              const metadata = readinessItemMetadata[role]
              const openUtterance = openUtterances[role]

              return (
                <div
                  key={role}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-center gap-2">
                    <metadata.icon className="size-4 text-emerald-300" />
                    <h2 className="text-sm font-medium text-foreground">{metadata.title}</h2>
                  </div>
                  <p className="mt-3 text-sm text-foreground">
                    {openUtterance?.combinedText ?? "No live utterance for this source."}
                  </p>
                  {openUtterance ? (
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <p>Stable: {openUtterance.stableText || "None yet"}</p>
                      <p>Preview: {openUtterance.previewText || "None"}</p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>Committed Transcript</CardTitle>
            <CardDescription>
              Only closed utterances appear here. Open partial and final fragments remain out of
              the timeline until turn closure is confirmed by the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[360px] pr-4">
              <div className="space-y-3">
                {closedUtterances.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                    No committed transcript turns yet.
                  </div>
                ) : null}

                {closedUtterances.map((utterance) => (
                  <div
                    key={utterance.utteranceId}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{utterance.source}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Channel {utterance.channel}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Closed {formatDateTime(utterance.turnClosedAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{utterance.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>AI Answers</CardTitle>
            <CardDescription>
              Streamed answer state is keyed by interviewer <code>utterance_id</code> and
              deduplicates repeated final answer events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[360px] pr-4">
              <div className="space-y-3">
                {interviewerClosedUtterances.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                    No interviewer turns have been closed yet.
                  </div>
                ) : null}

                {interviewerClosedUtterances.map((utterance) => {
                  const answer = aiAnswers[utterance.utteranceId]

                  return (
                    <div
                      key={utterance.utteranceId}
                      className="rounded-xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {utterance.utteranceId}
                        </p>
                        <Badge variant={answer?.status === "failed" ? "destructive" : "secondary"}>
                          {answer?.status ?? "idle"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{utterance.text}</p>
                      <div className="mt-3 flex items-start gap-2 text-sm text-foreground">
                        {answer?.status === "streaming" ? (
                          <LoaderCircle className="mt-0.5 size-4 animate-spin text-emerald-300" />
                        ) : answer?.status === "completed" ? (
                          <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                        ) : (
                          <Waves className="mt-0.5 size-4 text-muted-foreground" />
                        )}
                        <div className="min-w-0">
                          <p>{answer?.text || "Awaiting answer stream."}</p>
                          {answer?.error ? (
                            <p className="mt-2 text-xs text-destructive">{answer.error}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
