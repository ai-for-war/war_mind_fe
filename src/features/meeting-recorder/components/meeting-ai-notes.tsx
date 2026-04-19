import type { ReactNode } from "react";
import {
  CheckCheck,
  Clock3,
  ListTodo,
  Rows3,
  type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  MeetingDerivedNotesState,
  MeetingNoteActionItem,
  MeetingNoteChunk,
} from "@/features/meeting-recorder/types";
import { formatMeetingDateTime } from "@/features/meeting-recorder/utils";

type MeetingAiNotesProps = {
  desktop?: boolean;
  derivedNotes: MeetingDerivedNotesState;
  isWaitingForFinalNotes: boolean;
  noteChunks: MeetingNoteChunk[];
};

type AggregateSectionProps = {
  children: ReactNode;
  count: number;
  empty: boolean;
  filledHeightClassName?: string;
  icon: LucideIcon;
  scrollable?: boolean;
  title: string;
};

const renderTextList = (items: string[], emptyLabel: string) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded-xl border border-border/60 bg-background/40 px-3 py-3 text-sm leading-6 text-foreground"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-[11px] font-medium text-muted-foreground">
              {index + 1}
            </span>
            <p className="pt-0.5">{item}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const renderActionItems = (
  actionItems: MeetingNoteActionItem[],
  emptyLabel: string,
) => {
  if (actionItems.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {actionItems.map((actionItem, index) => (
        <li
          key={`${actionItem.text}-${index}`}
          className="rounded-xl border border-border/60 bg-background/40 px-3 py-3"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-[11px] font-medium text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-6 text-foreground">{actionItem.text}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Owner: {actionItem.ownerText ?? "Unassigned"} | Due:{" "}
                {actionItem.dueText ?? "Not specified"}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

const AggregateSection = ({
  children,
  count,
  empty,
  filledHeightClassName = "h-[18rem] min-h-[18rem]",
  icon: Icon,
  scrollable = true,
  title,
}: AggregateSectionProps) => {
  const useInternalScroll = !empty && scrollable;

  return (
    <section
      className={`${useInternalScroll ? `flex ${filledHeightClassName} flex-col` : ""} rounded-2xl border border-border/60 bg-muted/15 p-4`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">
              {empty ? "Waiting for AI output" : "Derived from additive note chunks"}
            </p>
          </div>
        </div>
        <Badge variant={empty ? "outline" : "default"}>{count}</Badge>
      </div>
      {empty || !scrollable ? (
        <div className="mt-4">{children}</div>
      ) : (
        <ScrollArea className="mt-4 min-h-0 flex-1 pr-2">
          {children}
        </ScrollArea>
      )}
    </section>
  );
};

export const MeetingAiNotes = ({
  desktop = false,
  derivedNotes,
  isWaitingForFinalNotes,
  noteChunks,
}: MeetingAiNotesProps) => {
  const newestFirstNoteChunks = [...noteChunks].sort((left, right) => {
    if (left.toSequence !== right.toSequence) {
      return right.toSequence - left.toSequence;
    }

    if (left.fromSequence !== right.fromSequence) {
      return right.fromSequence - left.fromSequence;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });

  const content = (
    <div className="space-y-5 pr-1">
      {isWaitingForFinalNotes ? (
        <Alert className="border-primary/20 bg-primary/5">
          <Clock3 className="size-4 text-primary" />
          <AlertTitle>Waiting for final AI notes</AlertTitle>
          <AlertDescription>
            Aggregate sections stay live and may continue updating as later
            note chunks arrive.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3">
        <AggregateSection
          count={derivedNotes.keyPoints.length}
          empty={derivedNotes.keyPoints.length === 0}
          icon={Rows3}
          scrollable={!desktop}
          title="Key points"
        >
          {renderTextList(
            derivedNotes.keyPoints,
            "No aggregate key points have been derived yet.",
          )}
        </AggregateSection>

        <AggregateSection
          count={derivedNotes.decisions.length}
          empty={derivedNotes.decisions.length === 0}
          icon={CheckCheck}
          scrollable={!desktop}
          title="Decisions"
        >
          {renderTextList(
            derivedNotes.decisions,
            "No aggregate decisions have been derived yet.",
          )}
        </AggregateSection>

        <AggregateSection
          count={derivedNotes.actionItems.length}
          empty={derivedNotes.actionItems.length === 0}
          icon={ListTodo}
          scrollable={!desktop}
          title="Action items"
        >
          {renderActionItems(
            derivedNotes.actionItems,
            "No aggregate action items have been derived yet.",
          )}
        </AggregateSection>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Chunk timeline
            </p>
            <p className="text-xs text-muted-foreground">
              Latest additive AI note payloads, newest first
            </p>
          </div>
          <Badge variant="outline">{noteChunks.length}</Badge>
        </div>

        {newestFirstNoteChunks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
            No note chunks received yet.
          </div>
        ) : (
          newestFirstNoteChunks.map((noteChunk, index) => {
            const chunkSignalCount =
              noteChunk.keyPoints.length +
              noteChunk.decisions.length +
              noteChunk.actionItems.length;

            return (
              <div
                key={noteChunk.id}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/15 p-4"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/70 via-primary/35 to-transparent" />
                <div className="pl-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">
                          {noteChunk.fromSequence} to {noteChunk.toSequence}
                        </Badge>
                        <Badge variant="outline">Chunk {index + 1}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Received {formatMeetingDateTime(noteChunk.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/60 px-2 py-1">
                        {chunkSignalCount} signals
                      </span>
                      <span className="rounded-full border border-border/60 px-2 py-1">
                        {noteChunk.actionItems.length} actions
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <AggregateSection
                        count={noteChunk.keyPoints.length}
                        empty={noteChunk.keyPoints.length === 0}
                        filledHeightClassName="h-[14rem] min-h-[14rem]"
                        icon={Rows3}
                        scrollable={!desktop}
                        title="Key points"
                      >
                        {renderTextList(
                          noteChunk.keyPoints,
                          "No key points in this chunk yet.",
                        )}
                      </AggregateSection>
                    </div>
                    <div className="space-y-2">
                      <AggregateSection
                        count={noteChunk.decisions.length}
                        empty={noteChunk.decisions.length === 0}
                        filledHeightClassName="h-[14rem] min-h-[14rem]"
                        icon={CheckCheck}
                        scrollable={!desktop}
                        title="Decisions"
                      >
                        {renderTextList(
                          noteChunk.decisions,
                          "No decisions in this chunk yet.",
                        )}
                      </AggregateSection>
                    </div>
                    <div className="space-y-2">
                      <AggregateSection
                        count={noteChunk.actionItems.length}
                        empty={noteChunk.actionItems.length === 0}
                        filledHeightClassName="h-[14rem] min-h-[14rem]"
                        icon={ListTodo}
                        scrollable={!desktop}
                        title="Action items"
                      >
                        {renderActionItems(
                          noteChunk.actionItems,
                          "No action items in this chunk yet.",
                        )}
                      </AggregateSection>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );

  if (desktop) {
    return (
      <Card className="flex min-h-full flex-col overflow-hidden border-border/60 bg-card/70">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>AI Notes</CardTitle>
            </div>
            <Badge variant={noteChunks.length > 0 ? "default" : "outline"}>
              {noteChunks.length} chunks
            </Badge>
          </div>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col overflow-hidden border-border/60 bg-card/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>AI Notes</CardTitle>
          </div>
          <Badge variant={noteChunks.length > 0 ? "default" : "outline"}>
            {noteChunks.length} chunks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="h-full min-h-0 flex-1 pr-2">
          {content}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
