import {
  AlertCircle,
  AudioLines,
  RefreshCcw,
  Square,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MeetingAiNotes } from "@/features/meeting-recorder/components/meeting-ai-notes";
import { MeetingCommittedTranscript } from "@/features/meeting-recorder/components/meeting-committed-transcript";
import { MeetingSessionControlPlane } from "@/features/meeting-recorder/components/meeting-session-control-plane";
import {
  MEETING_LANGUAGE_OPTIONS,
  MEETING_STATUS_LABELS,
} from "@/features/meeting-recorder/constants";
import { useMeetingSessionController } from "@/features/meeting-recorder/hooks";
import type { MeetingAudioLanguage } from "@/features/meeting-recorder/types";
import { getMeetingStatusBadgeVariant } from "@/features/meeting-recorder/utils";

type MeetingLanguageOption = {
  label: string;
  value: MeetingAudioLanguage;
};

export const MeetingRecorderPage = () => {
  const languageOptions: MeetingLanguageOption[] = MEETING_LANGUAGE_OPTIONS.map(
    (option) => ({
      label: option.label,
      value: option.value,
    }),
  );
  const {
    acceptedConfig,
    canFinalize,
    canForceStop,
    canReset,
    canStart,
    committedUtterances,
    derivedNotes,
    draftUtterances,
    finalizeMeetingSession,
    forceStopMeetingSession,
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
    terminalError,
  } = useMeetingSessionController();

  const selectedLanguageOption =
    languageOptions.find((option) => option.value === selectedLanguage) ?? null;

  const sessionControlPlaneCard = (
    <MeetingSessionControlPlane
      acceptedConfig={acceptedConfig}
      desktop
      draftUtterances={Object.values(draftUtterances)}
      identifiers={identifiers}
      lastEventAt={lastEventAt}
      selectedLanguage={selectedLanguage}
      sourceReadiness={sourceReadiness}
    />
  );

  const transcriptMonitorCard = (
    <MeetingCommittedTranscript committedUtterances={committedUtterances} desktop />
  );

  const aiNotesCard = (
    <MeetingAiNotes
      desktop
      derivedNotes={derivedNotes}
      isWaitingForFinalNotes={isWaitingForFinalNotes}
      noteChunks={noteChunks}
    />
  );

  const mobileSessionControlPlaneCard = (
    <MeetingSessionControlPlane
      acceptedConfig={acceptedConfig}
      draftUtterances={Object.values(draftUtterances)}
      identifiers={identifiers}
      lastEventAt={lastEventAt}
      selectedLanguage={selectedLanguage}
      sourceReadiness={sourceReadiness}
    />
  );

  const mobileTranscriptMonitorCard = (
    <MeetingCommittedTranscript committedUtterances={committedUtterances} />
  );

  const mobileAiNotesCard = (
    <MeetingAiNotes
      derivedNotes={derivedNotes}
      isWaitingForFinalNotes={isWaitingForFinalNotes}
      noteChunks={noteChunks}
    />
  );

  return (
    <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Meeting Recorder
            </h1>
            <Badge variant={getMeetingStatusBadgeVariant(status)}>
              {MEETING_STATUS_LABELS[status]}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Language
            </p>
            <Combobox
              items={languageOptions}
              itemToStringValue={(option) => `${option.label} ${option.value}`}
              value={selectedLanguageOption}
              onValueChange={(option) => {
                if (!option) {
                  return;
                }

                setSelectedLanguage(option.value);
              }}
              disabled={!canStart}
            >
              <ComboboxInput
                aria-label="Meeting transcription language"
                className="w-full md:w-[18rem]"
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
          </div>

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
              onClick={() => void finalizeMeetingSession()}
              disabled={!canFinalize}
            >
              <Square className="size-4" />
              Finalize
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void forceStopMeetingSession()}
              disabled={!canForceStop}
            >
              <AlertCircle className="size-4" />
              Force Stop
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

      <div className="hidden min-h-0 flex-1 xl:block">
        <ResizablePanelGroup
          className="h-full min-h-0 rounded-2xl border border-border/60 bg-card/25"
          orientation="horizontal"
        >
          <ResizablePanel defaultSize={30} minSize={24}>
            <div className="flex h-full min-h-0">
              <ScrollArea className="h-full min-h-0 flex-1 pr-2">
                <div className="min-h-full">{sessionControlPlaneCard}</div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={26}>
            <div className="flex h-full min-h-0">
              <ScrollArea className="h-full min-h-0 flex-1 pr-2">
                <div className="min-h-full">{transcriptMonitorCard}</div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={26}>
            <div className="flex h-full min-h-0">
              <ScrollArea className="h-full min-h-0 flex-1 pr-2">
                <div className="min-h-full">{aiNotesCard}</div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="space-y-4 xl:hidden">
        {mobileSessionControlPlaneCard}
        {mobileTranscriptMonitorCard}
        {mobileAiNotesCard}
      </div>
    </section>
  );
};
