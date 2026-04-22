import { formatAbsoluteDateTime } from "@/lib/date"

import type { StockResearchReportStatus } from "@/features/stock-research/types"

export const getStockResearchStatusLabel = (status: StockResearchReportStatus) => {
  switch (status) {
    case "queued":
      return "Queued"
    case "running":
      return "Running"
    case "completed":
      return "Completed"
    case "partial":
      return "Partial"
    case "failed":
      return "Failed"
    default:
      return status
  }
}

export const getStockResearchStatusBadgeClassName = (
  status: StockResearchReportStatus,
) => {
  switch (status) {
    case "queued":
      return "border-amber-400/30 bg-amber-400/10 text-amber-100"
    case "running":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
    case "completed":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
    case "partial":
      return "border-violet-400/30 bg-violet-400/10 text-violet-100"
    case "failed":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-border/60"
  }
}

export const formatStockResearchDateTime = (
  value: string | null | undefined,
  fallback = "--",
) => {
  const normalizedValue = value?.trim()

  return normalizedValue ? formatAbsoluteDateTime(normalizedValue, fallback) : fallback
}
