import { nanoid } from "nanoid"

import { MEETING_STREAM_ID_PREFIX } from "@/features/meeting-recorder/constants"
import type {
  MeetingClosedUtterance,
  MeetingDerivedNotesState,
  MeetingNoteChunk,
  MeetingSessionIdentifiers,
} from "@/features/meeting-recorder/types"

type MeetingGuardablePayload = {
  organization_id?: unknown
  stream_id?: unknown
  meeting_id?: unknown
}

export type GuardMeetingInboundEventOptions = {
  requireMeetingId?: boolean
  requireStreamId?: boolean
}

const buildMeetingIdentifier = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${nanoid(8)}`
}

const readOptionalString = (value: unknown): string | null => {
  return typeof value === "string" && value.length > 0 ? value : null
}

const sortCommittedUtterances = (
  left: MeetingClosedUtterance,
  right: MeetingClosedUtterance,
): number => {
  if (left.sequence !== right.sequence) {
    return left.sequence - right.sequence
  }

  return left.createdAt.localeCompare(right.createdAt)
}

const sortNoteChunks = (
  left: MeetingNoteChunk,
  right: MeetingNoteChunk,
): number => {
  if (left.fromSequence !== right.fromSequence) {
    return left.fromSequence - right.fromSequence
  }

  if (left.toSequence !== right.toSequence) {
    return left.toSequence - right.toSequence
  }

  return left.createdAt.localeCompare(right.createdAt)
}

export const createEmptyMeetingDerivedNotes = (): MeetingDerivedNotesState => ({
  meetingId: null,
  fromSequence: null,
  toSequence: null,
  keyPoints: [],
  decisions: [],
  actionItems: [],
  lastUpdatedAt: null,
})

export const generateMeetingStreamId = (): string => {
  return buildMeetingIdentifier(MEETING_STREAM_ID_PREFIX)
}

export const guardMeetingInboundEvent = <TPayload extends MeetingGuardablePayload>(
  payload: TPayload,
  activeIdentifiers: MeetingSessionIdentifiers | null,
  options: GuardMeetingInboundEventOptions = {},
): boolean => {
  if (!activeIdentifiers) {
    return false
  }

  const organizationId = readOptionalString(payload.organization_id)

  if (!organizationId || organizationId !== activeIdentifiers.organizationId) {
    return false
  }

  const shouldCheckStreamId = options.requireStreamId ?? "stream_id" in payload

  if (shouldCheckStreamId) {
    const streamId = readOptionalString(payload.stream_id)

    if (!streamId || streamId !== activeIdentifiers.streamId) {
      return false
    }
  }

  const shouldCheckMeetingId =
    options.requireMeetingId ?? ("meeting_id" in payload && activeIdentifiers.meetingId !== null)

  if (shouldCheckMeetingId) {
    const meetingId = readOptionalString(payload.meeting_id)

    if (!meetingId || meetingId !== activeIdentifiers.meetingId) {
      return false
    }
  }

  return true
}

export const upsertMeetingCommittedUtterance = (
  utterances: MeetingClosedUtterance[],
  utterance: MeetingClosedUtterance,
): MeetingClosedUtterance[] => {
  return [...utterances]
    .filter(
      (currentUtterance) =>
        currentUtterance.sequence !== utterance.sequence &&
        currentUtterance.utteranceId !== utterance.utteranceId,
    )
    .concat(utterance)
    .sort(sortCommittedUtterances)
}

export const upsertMeetingNoteChunk = (
  noteChunks: MeetingNoteChunk[],
  noteChunk: MeetingNoteChunk,
): MeetingNoteChunk[] => {
  return [...noteChunks]
    .filter(
      (currentChunk) =>
        currentChunk.id !== noteChunk.id &&
        !(
          currentChunk.fromSequence === noteChunk.fromSequence &&
          currentChunk.toSequence === noteChunk.toSequence
        ),
    )
    .concat(noteChunk)
    .sort(sortNoteChunks)
}

export const deriveMeetingNotesState = (
  noteChunks: MeetingNoteChunk[],
): MeetingDerivedNotesState => {
  if (noteChunks.length === 0) {
    return createEmptyMeetingDerivedNotes()
  }

  const orderedNoteChunks = [...noteChunks].sort(sortNoteChunks)
  const firstChunk = orderedNoteChunks[0]
  const lastChunk = orderedNoteChunks[orderedNoteChunks.length - 1]

  return {
    meetingId: lastChunk.meetingId,
    fromSequence: firstChunk.fromSequence,
    toSequence: lastChunk.toSequence,
    keyPoints: orderedNoteChunks.flatMap((chunk) => chunk.keyPoints),
    decisions: orderedNoteChunks.flatMap((chunk) => chunk.decisions),
    actionItems: orderedNoteChunks.flatMap((chunk) => chunk.actionItems),
    lastUpdatedAt: lastChunk.createdAt,
  }
}
