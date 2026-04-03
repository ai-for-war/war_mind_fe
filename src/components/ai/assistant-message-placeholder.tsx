import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Shimmer } from "./shimmer"

type AssistantMessagePlaceholderProps = {
  className?: string
}

export const AssistantMessagePlaceholder = ({ className }: AssistantMessagePlaceholderProps) => (
  // <div
  //   className={cn(
  //     "inline-flex h-8 items-center rounded-full bg-background/30 px-3 text-muted-foreground",
  //     className,
  //   )}
  // >
  <div>
<Shimmer>
    Assistant is thinking...
</Shimmer>
  </div>
  // </div>
)
