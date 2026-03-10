import type { Accept } from "react-dropzone"
import { useDropzone } from "react-dropzone"
import { FileAudio, Upload, X } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AUDIO_ACCEPT: Accept = {
  "audio/*": [".mp3", ".wav", ".m4a", ".flac", ".ogg"],
}

const AUDIO_MAX_SIZE = 20 * 1024 * 1024

export type FileDropzoneProps = {
  onFileSelect: (file: File | null) => void
  accept?: Accept
  maxSize?: number
  disabled?: boolean
  preset?: "audio"
  className?: string
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function FileDropzone({
  onFileSelect,
  accept,
  maxSize,
  disabled = false,
  preset,
  className,
}: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resolvedAccept = useMemo(() => {
    if (accept) return accept
    if (preset === "audio") return AUDIO_ACCEPT
    return undefined
  }, [accept, preset])

  const resolvedMaxSize = useMemo(() => {
    if (typeof maxSize === "number") return maxSize
    if (preset === "audio") return AUDIO_MAX_SIZE
    return undefined
  }, [maxSize, preset])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    disabled,
    accept: resolvedAccept,
    maxSize: resolvedMaxSize,
    onDropAccepted: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return
      setSelectedFile(file)
      setErrorMessage(null)
      onFileSelect(file)
    },
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0]
      if (!firstError) {
        setErrorMessage("File upload failed.")
        return
      }
      if (firstError.code === "file-invalid-type") {
        setErrorMessage("Invalid file type. Please upload a supported file format.")
        return
      }
      if (firstError.code === "file-too-large" && resolvedMaxSize) {
        setErrorMessage(`File is too large. Maximum size is ${formatFileSize(resolvedMaxSize)}.`)
        return
      }
      setErrorMessage(firstError.message)
    },
  })

  const clearFile = () => {
    setSelectedFile(null)
    setErrorMessage(null)
    onFileSelect(null)
  }

  if (selectedFile) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-card p-3",
          disabled ? "cursor-not-allowed opacity-60" : undefined,
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <FileAudio className="mt-0.5 size-4 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={clearFile}
            disabled={disabled}
            aria-label="Clear file"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border border-dashed p-6 transition-colors",
          "border-border bg-muted/20 hover:bg-muted/40",
          isDragActive && "border-primary bg-primary/10",
          disabled && "cursor-not-allowed opacity-60 hover:bg-muted/20"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="size-5 text-muted-foreground" />
          <p className="text-sm font-medium">Drag and drop or click to upload</p>
          {preset === "audio" ? (
            <p className="text-xs text-muted-foreground">Supported: MP3, WAV, M4A, FLAC, OGG (max 20MB)</p>
          ) : null}
        </div>
      </div>
      {errorMessage ? <p className="mt-2 text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  )
}
