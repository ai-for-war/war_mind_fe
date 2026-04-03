import {
  formatAiToolArgumentsSummary,
  getAiToolPresentation,
  toStableToolLabel,
  type AiToolPresentation,
} from "@/lib/ai-tool-presentation"

export type SuperAgentToolPresentation = AiToolPresentation

export const getSuperAgentToolPresentation = (toolName: string): SuperAgentToolPresentation =>
  getAiToolPresentation(toolName)

export const formatSuperAgentToolArgumentsSummary = (
  toolName: string,
  argumentsValue: Record<string, unknown>,
): string | null => formatAiToolArgumentsSummary(toolName, argumentsValue)

export { toStableToolLabel }
