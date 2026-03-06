import { isAxiosError } from "axios"
import { Calendar, Languages, Loader2, Trash2, Waves } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog"
import { WaveformPlayer } from "@/components/common/waveform-player"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteVoice } from "@/features/voice-cloning/hooks/use-delete-voice"
import { useVoiceDetail } from "@/features/voice-cloning/hooks/use-voice-detail"
import type { VoiceRecord } from "@/features/voice-cloning/types/voice.types"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
})

type VoiceCardProps = {
  voice: VoiceRecord
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

  return "Unable to complete this action right now."
}

export const VoiceCard = ({ voice }: VoiceCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteVoiceMutation = useDeleteVoice()
  const voiceDetailQuery = useVoiceDetail(isPreviewOpen ? voice.voice_id : undefined)

  const createdAt = useMemo(() => {
    const parsedDate = new Date(voice.created_at)
    if (Number.isNaN(parsedDate.getTime())) return "Unknown date"
    return DATE_FORMATTER.format(parsedDate)
  }, [voice.created_at])

  const deleteError = deleteVoiceMutation.error
    ? getErrorMessage(deleteVoiceMutation.error)
    : null
  const detailError = voiceDetailQuery.error ? getErrorMessage(voiceDetailQuery.error) : null

  const handleTogglePreview = () => {
    setIsPreviewOpen((current) => !current)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteVoiceMutation.mutateAsync(voice.voice_id)
      setIsDeleteDialogOpen(false)
    } catch {
      // Error is surfaced by mutation state in the card.
    }
  }

  return (
    <>
      <Card className="gap-4 py-4">
        <CardHeader className="px-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{voice.name}</CardTitle>
            <Badge>Cloned</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4 pt-0">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-1.5">
              <Languages className="size-4" />
              <span>{voice.language?.trim() || "Unknown"}</span>
            </p>
            <p className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>{createdAt}</span>
            </p>
          </div>

          {isPreviewOpen ? (
            <div className="space-y-2 rounded-md border border-border/80 bg-muted/20 p-3">
              {voiceDetailQuery.isLoading ? (
                <Skeleton className="h-14 w-full rounded-md" />
              ) : null}

              {detailError ? (
                <div className="space-y-2">
                  <p className="text-xs text-destructive">{detailError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => void voiceDetailQuery.refetch()}
                  >
                    Retry preview
                  </Button>
                </div>
              ) : null}

              {!voiceDetailQuery.isLoading && !detailError ? (
                <WaveformPlayer src={voiceDetailQuery.data?.source_audio_signed_url ?? undefined} />
              ) : null}
            </div>
          ) : null}

          {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
        </CardContent>

        <CardFooter className="justify-between gap-2 border-t px-4 pt-4">
          <Button type="button" size="sm" variant="outline" onClick={handleTogglePreview}>
            {voiceDetailQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Waves className="size-4" />
            )}
            {isPreviewOpen ? "Hide Preview" : "Play Source Audio"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteVoiceMutation.isPending}
        title="Delete cloned voice?"
        description="This voice will be removed permanently and cannot be restored."
      />
    </>
  )
}
