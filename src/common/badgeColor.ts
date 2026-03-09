
export const getBadgeColor = (status: string): string => {
    switch (status) {
      case "Fresh chat":
        return "bg-blue-500"
      case "submitting":
        return "bg-yellow-500"
      case "streaming":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }