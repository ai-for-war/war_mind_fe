import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { useStockResearchReport } from "@/features/stock-research/hooks/use-stock-research-report"
import { useStockResearchReports } from "@/features/stock-research/hooks/use-stock-research-reports"
import { normalizeStockResearchReportId } from "@/features/stock-research/types"

export const useStockResearchWorkspace = () => {
  const reportsQuery = useStockResearchReports()
  const [searchParams, setSearchParams] = useSearchParams()
  const normalizedSelectedReportId = normalizeStockResearchReportId(
    searchParams.get("reportId"),
  )
  const normalizedActiveReportId = useMemo(() => {
    const hasSelectedReport = reportsQuery.items.some(
      (report) => report.id === normalizedSelectedReportId,
    )

    if (hasSelectedReport) {
      return normalizedSelectedReportId
    }

    return null
  }, [normalizedSelectedReportId, reportsQuery.items])
  const activeReportSummary = useMemo(
    () =>
      reportsQuery.items.find((report) => report.id === normalizedActiveReportId) ?? null,
    [normalizedActiveReportId, reportsQuery.items],
  )
  const activeReportQuery = useStockResearchReport({
    reportId: normalizedActiveReportId,
  })

  const handleActiveReportChange = useCallback((reportId: string) => {
    const normalizedReportId = normalizeStockResearchReportId(reportId)

    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams)

      if (normalizedReportId) {
        nextSearchParams.set("reportId", normalizedReportId)
      } else {
        nextSearchParams.delete("reportId")
      }

      return nextSearchParams
    })
  }, [setSearchParams])

  const refreshWorkspace = useCallback(async () => {
    const refreshTasks: Promise<unknown>[] = [reportsQuery.refetch()]

    if (normalizedActiveReportId) {
      refreshTasks.push(activeReportQuery.refetch())
    }

    await Promise.all(refreshTasks)
  }, [activeReportQuery, normalizedActiveReportId, reportsQuery])

  return {
    activeReport: activeReportQuery.report,
    activeReportId: normalizedActiveReportId,
    activeReportQuery,
    activeReportSummary,
    refreshWorkspace,
    reportsQuery,
    setActiveReportId: handleActiveReportChange,
  }
}
