export interface MeetingNoteActionItem {
  text: string
  ownerText: string | null
  dueText: string | null
}

export interface MeetingNoteChunk {
  id: string
  meetingId: string
  fromSequence: number
  toSequence: number
  keyPoints: string[]
  decisions: string[]
  actionItems: MeetingNoteActionItem[]
  createdAt: string
}

export interface MeetingDerivedNotesState {
  meetingId: string | null
  fromSequence: number | null
  toSequence: number | null
  keyPoints: string[]
  decisions: string[]
  actionItems: MeetingNoteActionItem[]
  lastUpdatedAt: string | null
}
