import {
  AlertCircle,
  AudioLines,
  Clock3,
  FileText,
  Mic,
  RefreshCcw,
  Share2,
  Sparkles,
  Square,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MEETING_LANGUAGE_OPTIONS,
  MEETING_SOURCE_READINESS_LABELS,
  MEETING_STATUS_LABELS,
} from "@/features/meeting-recorder/constants"
import { useMeetingSessionController } from "@/features/meeting-recorder/hooks"
import type {
  MeetingAudioLanguage,
  MeetingNoteActionItem,
  MeetingSessionStatus,
} from "@/features/meeting-recorder/types"

type MeetingLanguageOption = {
  label: string
  value: MeetingAudioLanguage
}

type BadgeVariant = "default" | "destructive" | "outline" | "secondary"

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
})

const READINESS_METADATA = {
  meeting_tab: {
    description: "Shared Chromium meeting tab audio capture",
    icon: Share2,
    title: "Meeting tab",
  },
  microphone: {
    description: "Local microphone capture for your voice",
    icon: Mic,
    title: "Microphone",
  },
} as const

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Not available"
  }

  return DATE_TIME_FORMATTER.format(new Date(value))
}

const getStatusBadgeVariant = (status: MeetingSessionStatus): BadgeVariant => {
  if (status === "failed") {
    return "destructive"
  }

  if (status === "completed" || status === "streaming") {
    return "secondary"
  }

  return "outline"
}

const renderTextList = (items: string[], emptyLabel: string) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

const renderActionItems = (
  actionItems: MeetingNoteActionItem[],
  emptyLabel: string,
) => {
  if (actionItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-2">
      {actionItems.map((actionItem, index) => (
        <li
          key={`${actionItem.text}-${index}`}
          className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
        >
          <p className="text-sm text-foreground">{actionItem.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Owner: {actionItem.ownerText ?? "Unassigned"} | Due:{" "}
            {actionItem.dueText ?? "Not specified"}
          </p>
        </li>
      ))}
    </ul>
  )
}

export const MeetingRecorderPage = () => {
  const languageOptions: MeetingLanguageOption[] = MEETING_LANGUAGE_OPTIONS.map(
    (option) => ({
      label: option.label,
      value: option.value,
    }),
  )
  const {
    acceptedConfig,
    canReset,
    canStart,
    canStop,
    committedUtterances,
    derivedNotes,
    draftUtterances,
    identifiers,
    isWaitingForFinalNotes,
    lastEventAt,
    noteChunks,
    resetMeetingSession,
    selectedLanguage,
    setSelectedLanguage,
    sourceReadiness,
    startMeetingSession,
    status,
    stopMeetingSession,
    terminalError,
  } = useMeetingSessionController()

  const orderedDraftUtterances = Object.values(draftUtterances).sort((left, right) =>
    left.lastUpdatedAt.localeCompare(right.lastUpdatedAt),
  )
  const selectedLanguageOption =
    languageOptions.find((option) => option.value === selectedLanguage) ?? null

  return (
    <section className="flex flex-col gap-4 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Meeting Recorder
            </h1>
            <Badge variant={getStatusBadgeVariant(status)}>
              {MEETING_STATUS_LABELS[status]}
            </Badge>
            <Badge variant="outline">{selectedLanguage}</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Run one live meeting recorder session in this page, render
            normalized transcript state, and keep additive AI note chunks visible
            after capture stops.
          </p>
        </div>
      </header>

      {terminalError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{terminalError.code}</AlertTitle>
          <AlertDescription>
            <p>{terminalError.message}</p>
            <p>
              Source: {terminalError.source} | Retryable:{" "}
              {terminalError.retryable ? "Yes" : "No"}
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[0.95fr_1.05fr_1.15fr]">
        <Card className="flex min-h-[34rem] flex-col border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Session Control Plane</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Language
                  </p>
                  <Combobox
                    items={languageOptions}
                    itemToStringValue={(option) =>
                      `${option.label} ${option.value}`
                    }
                    value={selectedLanguageOption}
                    onValueChange={(option) => {
                      if (!option) {
                        return
                      }

                      setSelectedLanguage(option.value)
                    }}
                    disabled={!canStart}
                  >
                    <ComboboxInput
                      aria-label="Meeting transcription language"
                      className="w-full"
                      placeholder="Search language or code"
                      showClear
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>No language found.</ComboboxEmpty>
                      <ComboboxList>
                        {(option: MeetingLanguageOption) => (
                          <ComboboxItem key={option.value} value={option}>
                            {option.label} ({option.value})
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => void startMeetingSession()}
                      disabled={!canStart}
                    >
                      <AudioLines className="size-4" />
                      Start Session
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void stopMeetingSession()}
                      disabled={!canStop}
                    >
                      <Square className="size-4" />
                      Stop
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void resetMeetingSession()}
                      disabled={!canReset}
                    >
                      <RefreshCcw className="size-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Meeting ID
                    </p>
                    <p className="mt-2 break-all text-sm text-foreground">
                      {identifiers?.meetingId ?? "Awaiting meeting:start"}
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
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Last event
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatDateTime(lastEventAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Audio contract
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {acceptedConfig
                        ? `${acceptedConfig.language} | ${acceptedConfig.encoding} | ${acceptedConfig.sampleRate}Hz | ${acceptedConfig.channels}ch`
                        : `${selectedLanguage} | Awaiting meeting:started`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Source readiness
                  </p>
                  {(["meeting_tab", "microphone"] as const).map((role) => {
                    const metadata = READINESS_METADATA[role]
                    const readiness = sourceReadiness[role]

                    return (
                      <div
                        key={role}
                        className="rounded-xl border border-border/60 bg-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <metadata.icon className="size-4 text-primary" />
                              <p className="text-sm font-medium text-foreground">
                                {metadata.title}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {metadata.description}
                            </p>
                          </div>
                          <Badge
                            variant={readiness.isReady ? "secondary" : "outline"}
                            className="shrink-0"
                          >
                            {MEETING_SOURCE_READINESS_LABELS[readiness.status]}
                          </Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                          Updated {formatDateTime(readiness.updatedAt)}
                        </p>
                        {readiness.error ? (
                          <p className="mt-3 text-sm text-destructive">
                            {readiness.error}
                          </p>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex min-h-[34rem] flex-col border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Transcript Monitor</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Realtime drafts
                      </p>
                    </div>
                    <Badge variant="outline">{orderedDraftUtterances.length}</Badge>
                  </div>
                  {orderedDraftUtterances.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                      No live draft utterances yet.
                    </div>
                  ) : (
                    orderedDraftUtterances.map((utterance) => (
                      <div
                        key={utterance.utteranceId}
                        className="rounded-xl border border-border/60 bg-muted/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Draft</Badge>
                            <span className="text-xs text-muted-foreground">
                              {utterance.utteranceId}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Updated {formatDateTime(utterance.lastUpdatedAt)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground">
                          {utterance.combinedText ||
                            "Waiting for speech to stabilize."}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Committed transcript
                      </p>
                    </div>
                    <Badge variant="outline">{committedUtterances.length}</Badge>
                  </div>
                  {committedUtterances.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                      No committed transcript entries yet.
                    </div>
                  ) : (
                    committedUtterances.map((utterance) => (
                      <div
                        key={`${utterance.sequence}-${utterance.utteranceId}`}
                        className="rounded-xl border border-border/60 bg-muted/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Seq {utterance.sequence}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {utterance.utteranceId}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Closed {formatDateTime(utterance.createdAt)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground">
                          {utterance.combinedText ||
                            "No transcript text was committed."}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex min-h-[34rem] flex-col border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>AI Notes</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {isWaitingForFinalNotes ? (
                  <Alert>
                    <Sparkles className="size-4" />
                    <AlertTitle>Waiting for final AI notes</AlertTitle>
                    <AlertDescription>
                      Meeting capture has stopped, but later note chunks for this
                      meeting can still arrive and will append below.
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Aggregate notes
                      </p>
                    </div>
                    <Badge variant="outline">
                      {derivedNotes.fromSequence !== null &&
                      derivedNotes.toSequence !== null
                        ? `${derivedNotes.fromSequence} to ${derivedNotes.toSequence}`
                        : "No range"}
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Meeting ID
                      </p>
                      <p className="mt-2 break-all text-sm text-foreground">
                        {derivedNotes.meetingId ??
                          identifiers?.meetingId ??
                          "Not available"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Last updated
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {formatDateTime(derivedNotes.lastUpdatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Key points
                    </p>
                    {renderTextList(
                      derivedNotes.keyPoints,
                      "No aggregate key points have been derived yet.",
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Decisions
                    </p>
                    {renderTextList(
                      derivedNotes.decisions,
                      "No aggregate decisions have been derived yet.",
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Action items
                    </p>
                    {renderActionItems(
                      derivedNotes.actionItems,
                      "No aggregate action items have been derived yet.",
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <p className="text-sm font-medium text-foreground">
                        Additive note chunks
                      </p>
                    </div>
                    <Badge variant="outline">{noteChunks.length}</Badge>
                  </div>
                  {noteChunks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                      No note chunks received yet.
                    </div>
                  ) : (
                    noteChunks.map((noteChunk) => (
                      <div
                        key={noteChunk.id}
                        className="rounded-xl border border-border/60 bg-muted/20 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {noteChunk.fromSequence} to {noteChunk.toSequence}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {noteChunk.id}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Received {formatDateTime(noteChunk.createdAt)}
                          </span>
                        </div>
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Key points
                            </p>
                            {renderTextList(
                              noteChunk.keyPoints,
                              "No key points in this chunk yet.",
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Decisions
                            </p>
                            {renderTextList(
                              noteChunk.decisions,
                              "No decisions in this chunk yet.",
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Action items
                            </p>
                            {renderActionItems(
                              noteChunk.actionItems,
                              "No action items in this chunk yet.",
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
