import { Cpu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  formatStockResearchRuntimeChipLabel,
  getStockResearchRuntimeParts,
} from "@/features/stock-research/stock-research-runtime.utils"
import type { StockResearchRuntimeConfigResponse } from "@/features/stock-research/types"
import { cn } from "@/lib/utils"

type StockResearchRuntimeChipProps = {
  className?: string
  runtimeConfig: StockResearchRuntimeConfigResponse | null | undefined
}

const StockResearchRuntimeValue = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 text-xs">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 truncate font-mono text-foreground">{value}</dd>
  </div>
)

export const StockResearchRuntimeChip = ({
  className,
  runtimeConfig,
}: StockResearchRuntimeChipProps) => {
  const runtimeParts = getStockResearchRuntimeParts(runtimeConfig)
  const hasRuntimeConfig = runtimeParts.length > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 max-w-full rounded-full border-border/70 bg-background/45 px-3 text-xs text-muted-foreground hover:bg-background/70",
            className,
          )}
          aria-label="Show runtime metadata"
        >
          <Cpu data-icon="inline-start" />
          <span className="min-w-0 truncate font-mono">
            {formatStockResearchRuntimeChipLabel(runtimeConfig)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-xl border-border/70 bg-popover/95 p-4">
        <PopoverHeader>
          <PopoverTitle>Runtime snapshot</PopoverTitle>
          <PopoverDescription>
            {hasRuntimeConfig
              ? "Resolved runtime metadata persisted with this report."
              : "This report was created before runtime metadata was persisted."}
          </PopoverDescription>
        </PopoverHeader>

        {hasRuntimeConfig ? (
          <dl className="mt-4 flex flex-col gap-2">
            <StockResearchRuntimeValue label="Provider" value={runtimeConfig?.provider ?? ""} />
            <StockResearchRuntimeValue label="Model" value={runtimeConfig?.model ?? ""} />
            {runtimeConfig?.reasoning ? (
              <StockResearchRuntimeValue label="Reasoning" value={runtimeConfig.reasoning} />
            ) : null}
          </dl>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
