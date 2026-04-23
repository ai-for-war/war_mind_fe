import { Badge } from "@/components/ui/badge"
import type { StockResearchRuntimeConfigResponse } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchRuntimeBadgesProps = {
  className?: string
  runtimeConfig: StockResearchRuntimeConfigResponse | null | undefined
}

const normalizeRuntimeBadgeValue = (value: string | null | undefined) => {
  const normalizedValue = value?.trim()

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null
}

export const StockResearchRuntimeBadges = ({
  className,
  runtimeConfig,
}: StockResearchRuntimeBadgesProps) => {
  const provider = normalizeRuntimeBadgeValue(runtimeConfig?.provider)
  const reasoning = normalizeRuntimeBadgeValue(runtimeConfig?.reasoning)
  const model = normalizeRuntimeBadgeValue(runtimeConfig?.model)
  const hasRuntimeConfig = provider != null || reasoning != null || model != null

  if (!hasRuntimeConfig) {
    return (
      <div className={cn("flex min-w-0 flex-wrap gap-1.5", className)}>
        <Badge
          variant="outline"
          className="max-w-full rounded-full border-border/60 bg-background/35 px-2 py-0 text-[10px] font-normal text-muted-foreground"
        >
          Legacy runtime
        </Badge>
      </div>
    )
  }

  return (
    <div className={cn("flex min-w-0 flex-wrap gap-1.5", className)}>
      {provider ? (
        <Badge
          variant="outline"
          className="max-w-full rounded-full border-border/60 bg-background/35 px-2 py-0 font-mono text-[10px] font-normal text-foreground/80"
        >
          <span className="truncate">{provider}</span>
        </Badge>
      ) : null}
      {reasoning ? (
        <Badge
          variant="outline"
          className="max-w-full rounded-full border-cyan-400/35 bg-cyan-400/10 px-2 py-0 font-mono text-[10px] font-normal text-cyan-100"
        >
          <span className="truncate">{reasoning}</span>
        </Badge>
      ) : null}
      {model ? (
        <Badge
          variant="outline"
          className="max-w-full rounded-full border-border/60 bg-background/35 px-2 py-0 font-mono text-[10px] font-normal text-foreground/80"
        >
          <span className="truncate">{model}</span>
        </Badge>
      ) : null}
    </div>
  )
}
