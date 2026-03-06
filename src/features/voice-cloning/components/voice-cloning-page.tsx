import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CloneVoiceSheet } from "@/features/voice-cloning/components/clone-voice-sheet"
import { SystemVoiceCard } from "@/features/voice-cloning/components/system-voice-card"
import { VoiceCard } from "@/features/voice-cloning/components/voice-card"
import { useVoices } from "@/features/voice-cloning/hooks/use-voices"

const VoiceCardSkeleton = () => (
  <Card className="gap-4 py-4">
    <CardHeader className="space-y-3 px-4">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-2 px-4 pt-0">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
)

export const VoiceCloningPage = () => {
  const [isCloneSheetOpen, setIsCloneSheetOpen] = useState(false)
  const voicesQuery = useVoices()

  const systemVoices = voicesQuery.data?.system_voices ?? []
  const clonedVoices = voicesQuery.data?.cloned_voices ?? []
  const totalClonedVoices = voicesQuery.data?.total_cloned ?? clonedVoices.length

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Voice Cloning</h1>
          <p className="text-sm text-muted-foreground">
            Manage your voice library and clone new voices from reference audio.
          </p>
        </div>

        <Button type="button" onClick={() => setIsCloneSheetOpen(true)}>
          <Plus className="size-4" />
          Clone Voice
        </Button>
      </header>

      {voicesQuery.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-3">
              <p className="text-sm">Unable to load voices. Please try again.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void voicesQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">System Voices</h2>
        {voicesQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <VoiceCardSkeleton key={`system-loading-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemVoices.map((voice) => (
              <SystemVoiceCard key={voice.voice_id} voice={voice} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">My Cloned Voices</h2>
          <Badge variant="secondary">{totalClonedVoices}</Badge>
        </div>

        {voicesQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <VoiceCardSkeleton key={`cloned-loading-${index}`} />
            ))}
          </div>
        ) : null}

        {!voicesQuery.isLoading && clonedVoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <h3 className="text-base font-medium">No cloned voices yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Clone your first voice to start generating personalized speech.
            </p>
            <Button type="button" className="mt-4" onClick={() => setIsCloneSheetOpen(true)}>
              <Plus className="size-4" />
              Clone Your First Voice
            </Button>
          </div>
        ) : null}

        {!voicesQuery.isLoading && clonedVoices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clonedVoices.map((voice) => (
              <VoiceCard key={voice.id} voice={voice} />
            ))}
          </div>
        ) : null}
      </section>

      <CloneVoiceSheet open={isCloneSheetOpen} onOpenChange={setIsCloneSheetOpen} />
    </section>
  )
}
