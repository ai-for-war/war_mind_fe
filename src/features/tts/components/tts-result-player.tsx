import { WaveformPlayer } from "@/components/common/waveform-player"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TtsResultPlayerProps = {
  signedUrl?: string
}

export const TtsResultPlayer = ({ signedUrl }: TtsResultPlayerProps) => {
  if (!signedUrl) return null

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Latest Result</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <WaveformPlayer src={signedUrl} />
      </CardContent>
    </Card>
  )
}
