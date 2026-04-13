export const formatNullableValue = (value: string | number | null | undefined): string =>
  value == null || `${value}`.trim().length === 0 ? "--" : `${value}`

export const formatNullableNumber = (value: number | null | undefined): string =>
  value == null
    ? "--"
    : new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(value)

export const formatNullablePercent = (value: number | null | undefined): string =>
  value == null
    ? "--"
    : `${new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(value)}%`

export const hasNarrativeContent = (value: string | null | undefined) =>
  value != null && value.trim().length > 0

export const parseDateValue = (value: string | null | undefined): number | null => {
  if (!value) {
    return null
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return null
  }

  return parsedValue.getTime()
}
