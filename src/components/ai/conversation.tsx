import { ArrowDownIcon } from "lucide-react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import type { ComponentProps, ReactNode } from "react"
import { useCallback } from "react"
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom"
import { Button } from "@/components/ui/button"
import { ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Message, MessageContent } from "@/components/ai/message"

export type ConversationProps = ComponentProps<typeof StickToBottom>

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
)

export type ConversationContentProps = Omit<
  ComponentProps<typeof StickToBottom.Content>,
  "children"
> & {
  children?: ReactNode
}

export const ConversationContent = ({
  children,
  className,
  scrollClassName,
  ...props
}: ConversationContentProps) => {
  const { contentRef, scrollRef } = useStickToBottomContext()
  const handleScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef(node)
    },
    [scrollRef],
  )
  const handleContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef(node)
    },
    [contentRef],
  )

  return (
    <ScrollAreaPrimitive.Root className="size-full rounded-[inherit]">
      <ScrollAreaPrimitive.Viewport
        ref={handleScrollRef}
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          scrollClassName,
        )}
      >
        <div className={cn("flex flex-col gap-8 p-4", className)} ref={handleContentRef} {...props}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </>
    )}
  </div>
)

export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    !isAtBottom && (
      <Button
        className={cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full", className)}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  )
}

/** Demo component for preview */
export default function ConversationDemo() {
  const messages = [
    { id: "1", from: "user" as const, text: "Hello, how are you?" },
    {
      id: "2",
      from: "assistant" as const,
      text: "I'm good, thank you! How can I assist you today?",
    },
    { id: "3", from: "user" as const, text: "I'm looking for information about your services." },
    {
      id: "4",
      from: "assistant" as const,
      text: "Sure! We offer a variety of AI solutions. What are you interested in?",
    },
  ]

  return (
    <Conversation className="relative size-full p-4">
      <ConversationContent>
        {messages.map(msg => (
          <Message from={msg.from} key={msg.id}>
            <MessageContent>{msg.text}</MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
