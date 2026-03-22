import { Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  MeetingDerivedNotesState,
  MeetingNoteActionItem,
  MeetingNoteChunk,
} from "@/features/meeting-recorder/types";
import { formatMeetingDateTime } from "@/features/meeting-recorder/utils";

type MeetingAiNotesProps = {
  derivedNotes: MeetingDerivedNotesState;
  isWaitingForFinalNotes: boolean;
  noteChunks: MeetingNoteChunk[];
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
          className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground"
        >
          {item}
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
  );
};

export const MeetingAiNotes = ({
  derivedNotes,
  isWaitingForFinalNotes,
  noteChunks,
}: MeetingAiNotesProps) => {
  return (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col overflow-hidden border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle>AI Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
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
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Received {formatMeetingDateTime(noteChunk.createdAt)}
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
  );
};
