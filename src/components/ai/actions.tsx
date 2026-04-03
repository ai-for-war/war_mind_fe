"use client"

import { CheckIcon, CopyIcon, RefreshCcwIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { cn } from "../../lib/utils"
import { Message, MessageContent } from "./message"

export type ActionsProps = ComponentProps<"div">

export const Actions = ({ className, children, ...props }: ActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
)

export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string
  label?: string
}

export const Action = ({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ActionProps) => {
  const button = (
    <Button
      className={cn("size-9 p-1.5 text-muted-foreground hover:text-foreground", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export type CopyActionProps = Omit<ActionProps, "children" | "onClick"> & {
  copiedLabel?: string
  copiedTooltip?: string
  text: string
}

export const CopyAction = ({
  copiedLabel = "Copied",
  copiedTooltip = "Copied",
  label = "Copy message",
  text,
  tooltip = "Copy message",
  ...props
}: CopyActionProps) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false)
    }, 1500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [isCopied])

  const handleCopy = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard || text.trim().length === 0) {
      toast.error("Nothing to copy yet.")
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast.success("Message copied to clipboard.")
    } catch {
      toast.error("Unable to copy this message.")
    }
  }, [text])

  return (
    <Action
      aria-label={isCopied ? copiedLabel : label}
      label={isCopied ? copiedLabel : label}
      onClick={handleCopy}
      tooltip={isCopied ? copiedTooltip : tooltip}
      {...props}
    >
      {isCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </Action>
  )
}

/** Demo component for preview */
export default function ActionsDemo() {
  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <Message from="assistant">
        <MessageContent>
          Here's a quick example of how to use React hooks. The useState hook lets you add state to
          functional components, while useEffect handles side effects like data fetching or
          subscriptions.
        </MessageContent>

        <Actions>
          <Action onClick={() => console.log("Copied!")} tooltip="Copy to clipboard">
            <CopyIcon className="size-4" />
          </Action>
          <Action onClick={() => console.log("Regenerating...")} tooltip="Regenerate response">
            <RefreshCcwIcon className="size-4" />
          </Action>
          <Action onClick={() => console.log("Thumbs up!")} tooltip="Good response">
            <ThumbsUpIcon className="size-4" />
          </Action>
          <Action onClick={() => console.log("Thumbs down!")} tooltip="Bad response">
            <ThumbsDownIcon className="size-4" />
          </Action>
        </Actions>
      </Message>
    </div>
  )
}
