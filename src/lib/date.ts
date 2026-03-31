import { format } from "date-fns"

export const formatAbsoluteDateTime = (
  value: string,
  fallback = value,
): string => {
  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return fallback
  }

  return format(parsedValue, "MMM d, yyyy h:mm a")
}
