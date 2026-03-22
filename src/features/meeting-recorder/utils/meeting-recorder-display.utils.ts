import type {
  MeetingSessionStatus,
  MeetingTranscriptMessage,
} from "@/features/meeting-recorder/types";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
});

export const formatMeetingDateTime = (value: string | null): string => {
  if (!value) {
    return "Not available";
  }

  return DATE_TIME_FORMATTER.format(new Date(value));
};

export const getMeetingStatusBadgeVariant = (
  status: MeetingSessionStatus,
) => {
  if (status === "failed") {
    return "destructive";
  }

  if (status === "completed" || status === "streaming") {
    return "default";
  }

  return "outline";
};

export const getMeetingSpeakerLabel = (
  message: MeetingTranscriptMessage,
): string => {
  if (message.speakerLabel) {
    return message.speakerLabel;
  }

  if (message.speakerIndex !== null) {
    return `Speaker ${message.speakerIndex}`;
  }

  return "Speaker";
};
