import { useState } from "react";
import {
  AlertCircle,
  AudioLines,
  RefreshCcw,
  Square,
} from "lucide-react";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai/message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useInterviewSessionController } from "@/features/interview-lab/hooks";
import { Shimmer } from "@/components/ai/shimmer";
import { READINESS_ITEM_METADATA, STATUS_LABELS, READINESS_LABELS } from "@/features/interview-lab/constants/interview-lab.constants";
import { formatDateTime, getStatusBadgeVariant } from "@/features/interview-lab/utils/interview-session.utils";
import { cn } from "@/lib/utils";

const AiAnswerUtterancePreview = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-2">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto hover:cursor-pointer w-full justify-start px-0 py-0 text-left font-normal whitespace-normal hover:bg-transparent"
        >
          <p
            className={cn(
              "w-full text-xs leading-5 text-muted-foreground  hover:text-primary",
              isExpanded ? "text-foreground" : "line-clamp-2",
            )}
          >
            {text}
          </p>
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
};

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
  } = useInterviewSessionController();

  const interviewerClosedUtterances = closedUtterances.filter(
    (utterance) => utterance.source === "interviewer",
  );
  const newestFirstClosedUtterances = [...closedUtterances].reverse();
  const newestFirstInterviewerClosedUtterances = [
    ...interviewerClosedUtterances,
  ].reverse();

  const sessionControlPlaneCard = (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col border-border/60 bg-card/70">
      <CardHeader className="">
        <CardTitle>Session Control Plane</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4">
            <div className="space-y-3">
              {/* <div className="space-y-1">
            <h2 className="text-sm font-medium text-foreground">Open Utterances</h2>
            <p className="text-sm text-muted-foreground">
              Partial and stable fragments stay here until <code>stt:utterance_closed</code>.
            </p>
          </div> */}

              {(["interviewer", "user"] as const).map((role) => {
                const metadata = READINESS_ITEM_METADATA[role];
                const openUtterance = openUtterances[role];

                return (
                  <div
                    key={role}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <metadata.icon className="size-4 text-emerald-300" />
                      <h3 className="text-sm font-medium text-foreground">
                        {metadata.title}
                      </h3>
                    </div>
                    <p className="mt-3 text-sm text-foreground">
                      {openUtterance?.stableText ||
                        "No stable utterance for this source yet."}
                    </p>
                    {openUtterance ? (
                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        {/* <p>Stable: {openUtterance.stableText || "None yet"}</p> */}
                        <p>Preview: {openUtterance.combinedText || "None"}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <Separator />

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
                <p className="mt-2 text-sm font-medium text-foreground">
                  <Badge variant={getStatusBadgeVariant(status)}>
                    {STATUS_LABELS[status]}
                  </Badge>
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
                    ? `${acceptedConfig.encoding} · ${acceptedConfig.sampleRate}Hz · ${acceptedConfig.channels}ch`
                    : "Awaiting stt:started"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(["interviewer", "user"] as const).map((role) => {
                const metadata = READINESS_ITEM_METADATA[role];
                const readiness = sourceReadiness[role];

                return (
                  <div
                    key={role}
                    className="rounded-xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {metadata.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {metadata.description}
                        </p>
                      </div>
                      <Badge
                        variant={readiness.isReady ? "secondary" : "outline"}
                        className="shrink-0"
                      >
                        {READINESS_LABELS[readiness.status]}
                      </Badge>
                    </div>
                    {readiness.error ? (
                      <p className="mt-3 text-sm text-destructive">
                        {readiness.error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const transcriptMonitorCard = (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col border-border/60 bg-card/70">
      <CardHeader className="space-y-2">
        <CardTitle>Transcript Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-6">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {/* <div className="space-y-1">
            <h2 className="text-sm font-medium text-foreground">Committed Transcript</h2>
            <p className="text-sm text-muted-foreground">
              Only closed utterances appear here as the authoritative conversation timeline.
            </p>
          </div> */}

          <ScrollArea className="min-h-0 flex-1 ">
            {" "}
            {/* //pr-4 */}
            <div className="space-y-3">
              {newestFirstClosedUtterances.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                  No committed transcript turns yet.
                </div>
              ) : null}

              {newestFirstClosedUtterances.map((utterance) => (
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
                  <p className="mt-3 text-sm text-foreground">
                    {utterance.text}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );

  const aiAnswersCard = (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col border-border/60 bg-card/70">
      <CardHeader className="space-y-2">
        <CardTitle>AI Answers</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 ">
          <div className="space-y-3">
            {newestFirstInterviewerClosedUtterances.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                No interviewer turns have been closed yet.
              </div>
            ) : null}

            {newestFirstInterviewerClosedUtterances.map((utterance) => {
              const answer = aiAnswers[utterance.utteranceId];
              const answerText = answer?.text;

              return (
                <div
                  key={utterance.utteranceId}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {utterance.utteranceId}
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(answer?.status ?? "idle")}
                    >
                      {answer?.status ?? "idle"}
                    </Badge>
                  </div>
                  <AiAnswerUtterancePreview text={utterance.text} />
                  <Message className="mt-3 max-w-full" from="assistant">
                    {answerText ? (
                    <MessageContent className="w-full rounded-lg border border-border/60 bg-primary/10 p-4">
                        <MessageResponse>{answerText}</MessageResponse>
                      </MessageContent>
                    ) : 
                    <MessageContent className="w-full rounded-lg border border-border/60 bg-primary/10 p-4">
                      <Shimmer className="font-semibold">
                          AI is generating an answer...
                        </Shimmer>
                    </MessageContent>
                    }
                  </Message>
                  {answer?.error ? (
                    <p className="mt-2 text-xs text-destructive">
                      {answer.error}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <section className="flex flex-col gap-2 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="space-x-4 flex ">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Interview Lab
            </h1>
            {/* <p className="max-w-3xl text-sm text-muted-foreground">
              Start a Chromium-only interview runtime, stream separate interviewer and user
              audio lanes, and inspect normalized transcript plus answer state in real time.
            </p> */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusBadgeVariant(status)}>
                {STATUS_LABELS[status]}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/10 bg-white/5 text-muted-foreground"
              >
                {terminalReason
                  ? `Terminal: ${terminalReason}`
                  : "Runtime host active"}
              </Badge>
            </div>
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
              Source: {error.source} | Retryable:{" "}
              {error.retryable ? "Yes" : "No"}
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="hidden min-h-0 flex-1 xl:block">
        <ResizablePanelGroup
          className="h-full min-h-0 rounded-2xl border border-border/60 bg-card/25"
          orientation="horizontal"
        >
          <ResizablePanel defaultSize={31} minSize={24}>
            <div className="h-full min-h-0">{sessionControlPlaneCard}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={36} minSize={26}>
            <div className="h-full min-h-0">{transcriptMonitorCard}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={33} minSize={24}>
            <div className="h-full min-h-0">{aiAnswersCard}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="space-y-4 xl:hidden">
        {aiAnswersCard}
        {transcriptMonitorCard}
        {sessionControlPlaneCard}
      </div>
    </section>
  );
};
