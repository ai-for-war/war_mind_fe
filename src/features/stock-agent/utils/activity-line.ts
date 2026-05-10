const toHumanizedToolName = (toolName: string): string =>
  toolName
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ")

export const formatStockAgentActivityLabel = (toolName: string): string => {
  const normalizedToolName = toolName.trim()

  if (!normalizedToolName) {
    return "Running stock agent tool"
  }

  return `Running ${toHumanizedToolName(normalizedToolName)}`
}
