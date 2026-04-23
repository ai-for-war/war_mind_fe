import type { StockResearchReportSourceResponse } from "@/features/stock-research/types"

const STOCK_RESEARCH_CITATION_PREFIX = "#stock-research-citation-"
const STOCK_RESEARCH_CITATION_PATTERN = /\[(s\d+)\]/gi

export const normalizeStockResearchSourceId = (sourceId?: string | null): string | null => {
  const normalizedSourceId = sourceId?.trim()

  if (!normalizedSourceId) {
    return null
  }

  return normalizedSourceId.toUpperCase()
}

export const buildStockResearchCitationHref = (sourceId: string): string => {
  const normalizedSourceId = normalizeStockResearchSourceId(sourceId)

  return `${STOCK_RESEARCH_CITATION_PREFIX}${normalizedSourceId ?? sourceId}`
}

export const getStockResearchCitationSourceIdFromHref = (
  href?: string | null,
): string | null => {
  if (typeof href !== "string" || !href.startsWith(STOCK_RESEARCH_CITATION_PREFIX)) {
    return null
  }

  return normalizeStockResearchSourceId(href.slice(STOCK_RESEARCH_CITATION_PREFIX.length))
}

export const replaceStockResearchCitationMarkers = (content?: string | null): string => {
  if (typeof content !== "string" || content.trim().length === 0) {
    return ""
  }

  return content.replace(STOCK_RESEARCH_CITATION_PATTERN, (_, sourceId: string) => {
    const normalizedSourceId = normalizeStockResearchSourceId(sourceId) ?? sourceId
    return `[${normalizedSourceId}](${buildStockResearchCitationHref(normalizedSourceId)})`
  })
}

export const buildStockResearchSourcesById = (
  sources: StockResearchReportSourceResponse[],
): Record<string, StockResearchReportSourceResponse> =>
  sources.reduce<Record<string, StockResearchReportSourceResponse>>((accumulator, source) => {
    const normalizedSourceId = normalizeStockResearchSourceId(source.source_id)

    if (normalizedSourceId) {
      accumulator[normalizedSourceId] = source
    }

    return accumulator
  }, {})
