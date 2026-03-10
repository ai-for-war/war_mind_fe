import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox"
import { useVoices } from "@/features/voice-cloning"

type VoiceOption = {
  label: string
  voiceId: string
}

type VoiceSelectorProps = {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export const VoiceSelector = ({
  value,
  onValueChange,
  disabled = false,
}: VoiceSelectorProps) => {
  const voicesQuery = useVoices()
  const systemVoices = voicesQuery.data?.system_voices ?? []
  const clonedVoices = voicesQuery.data?.cloned_voices ?? []

  const clonedOptions: VoiceOption[] = clonedVoices.map((v) => ({
    label: v.name,
    voiceId: v.voice_id,
  }))

  const systemOptions: VoiceOption[] = systemVoices.map((v) => ({
    label: v.voice_name,
    voiceId: v.voice_id,
  }))

  const allOptions = [...clonedOptions, ...systemOptions]

  const selectedOption = allOptions.find((opt) => opt.voiceId === value) ?? null

  return (
    <Combobox
      items={allOptions}
      itemToStringValue={(opt) => opt.label}
      value={selectedOption}
      onValueChange={(opt) => {
        if (opt) onValueChange(opt.voiceId)
      }}
      disabled={disabled || voicesQuery.isLoading}
    >
      <ComboboxInput
        className="w-full"
        placeholder={voicesQuery.isLoading ? "Loading voices..." : "Select a voice"}
      />
      <ComboboxContent>
        <ComboboxEmpty>No voice found.</ComboboxEmpty>
        <ComboboxList>
          {clonedOptions.length > 0 ? (
            <>
              <ComboboxGroup>
                <ComboboxLabel>My Cloned Voices</ComboboxLabel>
                {clonedOptions.map((opt) => (
                  <ComboboxItem key={`cloned-${opt.voiceId}`} value={opt}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
              <ComboboxSeparator />
            </>
          ) : null}

          <ComboboxGroup>
            <ComboboxLabel>System Voices</ComboboxLabel>
            {systemOptions.map((opt) => (
              <ComboboxItem key={`system-${opt.voiceId}`} value={opt}>
                {opt.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
