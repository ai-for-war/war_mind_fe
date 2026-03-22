import { Mic, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MEETING_SOURCE_READINESS_LABELS } from "@/features/meeting-recorder/constants";
import type {
  MeetingAcceptedSessionConfig,
  MeetingAudioLanguage,
  MeetingDraftUtterance,
  MeetingSessionIdentifiers,
  MeetingSourceReadinessState,
  MeetingSourceRole,
} from "@/features/meeting-recorder/types";
import { formatMeetingDateTime } from "@/features/meeting-recorder/utils";

type MeetingSessionControlPlaneProps = {
  acceptedConfig: MeetingAcceptedSessionConfig | null;
  draftUtterances: MeetingDraftUtterance[];
  identifiers: MeetingSessionIdentifiers | null;
  lastEventAt: string | null;
  selectedLanguage: MeetingAudioLanguage;
  sourceReadiness: Record<MeetingSourceRole, MeetingSourceReadinessState>;
};

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
} as const;

export const MeetingSessionControlPlane = ({
  acceptedConfig,
  draftUtterances,
  identifiers,
  lastEventAt,
  selectedLanguage,
  sourceReadiness,
}: MeetingSessionControlPlaneProps) => {
  const orderedDraftUtterances = [...draftUtterances].sort((left, right) =>
    left.lastUpdatedAt.localeCompare(right.lastUpdatedAt),
  );
  const combinedRealtimeDraftText = orderedDraftUtterances
    .map((utterance) => utterance.combinedText.trim())
    .filter((combinedText) => combinedText.length > 0)
    .join(" ");
  const latestDraftUpdatedAt =
    orderedDraftUtterances[orderedDraftUtterances.length - 1]?.lastUpdatedAt ??
    null;

  return (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col overflow-hidden border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle>Session Control Plane</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6">
            <div className="space-y-3">
              {orderedDraftUtterances.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                  No live draft utterances yet.
                </div>
              ) : (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Draft</Badge>
                      <span className="text-xs text-muted-foreground">
                        {orderedDraftUtterances.length} segments
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Updated {formatMeetingDateTime(latestDraftUpdatedAt)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm leading-6 text-foreground">
                      {combinedRealtimeDraftText ||
                        "Waiting for speech to stabilize."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              {(["meeting_tab", "microphone"] as const).map((role) => {
                const metadata = READINESS_METADATA[role];
                const readiness = sourceReadiness[role];

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
                        variant={readiness.isReady ? "default" : "outline"}
                        className="shrink-0"
                      >
                        {MEETING_SOURCE_READINESS_LABELS[readiness.status]}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Updated {formatMeetingDateTime(readiness.updatedAt)}
                    </p>
                    {readiness.error ? (
                      <p className="mt-3 text-sm text-destructive">
                        {readiness.error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
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
                  {formatMeetingDateTime(lastEventAt)}
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
