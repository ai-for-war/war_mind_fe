import type { StockResearchScheduleStatus } from "@/features/stock-research/types"

export const getStockResearchScheduleStatusLabel = (
  status: StockResearchScheduleStatus,
) => {
  if (status === "active") {
    return "Active"
  }

  if (status === "paused") {
    return "Paused"
  }

  return "Deleted"
}

export const getStockResearchScheduleStatusBadgeClassName = (
  status: StockResearchScheduleStatus,
) => {
  if (status === "active") {
    return "border-emerald-400/35 bg-emerald-400/10 text-emerald-100"
  }

  if (status === "paused") {
    return "border-amber-400/35 bg-amber-400/10 text-amber-100"
  }

  return "border-border/60 bg-background/35 text-muted-foreground"
}
