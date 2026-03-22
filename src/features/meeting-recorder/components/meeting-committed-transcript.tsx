import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  MeetingClosedUtterance,
  MeetingTranscriptMessage,
} from "@/features/meeting-recorder/types";
import {
  formatMeetingDateTime,
  getMeetingSpeakerLabel,
} from "@/features/meeting-recorder/utils";

type MeetingCommittedTranscriptProps = {
  committedUtterances: MeetingClosedUtterance[];
};

const renderTranscriptMessages = (
  messages: MeetingTranscriptMessage[],
  emptyLabel: string,
) => {
  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {messages.map((message, index) => (
        <div
          key={`${getMeetingSpeakerLabel(message)}-${message.text}-${index}`}
          className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getMeetingSpeakerLabel(message)}</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-foreground">{message.text}</p>
        </div>
      ))}
    </div>
  );
};

export const MeetingCommittedTranscript = ({
  committedUtterances,
}: MeetingCommittedTranscriptProps) => {
  const newestFirstCommittedUtterances = [...committedUtterances].sort(
    (left, right) => {
      if (left.sequence !== right.sequence) {
        return right.sequence - left.sequence;
      }

      return right.createdAt.localeCompare(left.createdAt);
    },
  );

  return (
    <Card className="flex h-[44rem] max-h-[44rem] flex-col overflow-hidden border-border/60 bg-card/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Committed Transcript</CardTitle>
          <Badge variant="default">{committedUtterances.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3">
            {newestFirstCommittedUtterances.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                No committed transcript entries yet.
              </div>
            ) : (
              newestFirstCommittedUtterances.map((utterance) => (
                <div
                  key={`${utterance.sequence}-${utterance.utteranceId}`}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Seq {utterance.sequence}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Closed {formatMeetingDateTime(utterance.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3">
                    {utterance.messages.length > 0
                      ? renderTranscriptMessages(
                          utterance.messages,
                          "No transcript text was committed.",
                        )
                      : (
                          <p className="text-sm leading-6 text-foreground">
                            {utterance.combinedText ||
                              "No transcript text was committed."}
                          </p>
                        )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
