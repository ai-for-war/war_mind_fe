import { isAxiosError } from "axios"
import { Calendar, Clock3, Loader2, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { WaveformPlayer } from "@/components/common/waveform-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDeleteAudio } from "@/features/tts/hooks/use-delete-audio"
import type { AudioFileRecord } from "@/features/tts/types/tts.types"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
})

type AudioHistoryItemProps = {
  audio: AudioFileRecord
  signedUrl?: string
}

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim().length > 0) {
      return data
    }

    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message
    }
  }

  return "Unable to delete this audio right now."
}

export const AudioHistoryItem = ({ audio, signedUrl }: AudioHistoryItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const deleteAudioMutation = useDeleteAudio()

  const createdAt = useMemo(() => {
    const parsedDate = new Date(audio.created_at)
    if (Number.isNaN(parsedDate.getTime())) return "Unknown date"
    return DATE_FORMATTER.format(parsedDate)
  }, [audio.created_at])

  const deleteError = deleteAudioMutation.error
    ? getErrorMessage(deleteAudioMutation.error)
    : null

  const handleConfirmDelete = async () => {
    try {
      await deleteAudioMutation.mutateAsync(audio.id)
      setIsDeleteDialogOpen(false)
    } catch {
      // Error is surfaced via mutation state.
    }
  }

  return (
    <>
      <Card className="gap-4 py-4">
        <CardHeader className="space-y-2 px-4">
          <CardTitle className="text-base leading-5">{audio.voice_id}</CardTitle>
          <p
            className="overflow-hidden text-sm text-muted-foreground"
            style={{
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              display: "-webkit-box",
            }}
          >
            {audio.source_text}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDuration(audio.duration_ms)}
            </p>
            <p className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              {createdAt}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4 pt-0">
          <WaveformPlayer src={signedUrl} variant="compact" />
          {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteAudioMutation.isPending}
            >
              {deleteAudioMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteAudioMutation.isPending}
        title="Delete generated audio?"
        description="This audio entry will be removed permanently."
      />
    </>
  )
}
