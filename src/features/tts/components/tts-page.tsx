import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TtsComposeForm } from "@/features/tts/components/tts-compose-form"
import { TtsResultPlayer } from "@/features/tts/components/tts-result-player"
import type { GenerateAudioResponse } from "@/features/tts/types/tts.types"

import { AudioHistoryList } from "./audio-history-list"

export const TtsPage = () => {
  const [latestSignedUrl, setLatestSignedUrl] = useState<string>()

  const handleGenerateSuccess = (response: GenerateAudioResponse) => {
    setLatestSignedUrl(response.signed_url)
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Text to Speech</h1>
        <p className="text-sm text-muted-foreground">
          Compose speech with your available voices and manage generated audio history.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
          <Card className="gap-4 py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-base">Compose</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-0">
              <TtsComposeForm onGenerateSuccess={handleGenerateSuccess} />
            </CardContent>
          </Card>

          <TtsResultPlayer signedUrl={latestSignedUrl} />
        </div>

        <AudioHistoryList />
      </div>
    </section>
  )
}
