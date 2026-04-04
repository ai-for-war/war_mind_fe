export type PlanTodoStatus = "completed" | "in_progress" | "pending" | "unknown"

export type PlanTodoSummary = {
  completed: number
  in_progress: number
  pending: number
  total: number
}

export const normalizePlanTodoStatus = (status: string): PlanTodoStatus => {
  const normalizedStatus = status.trim().toLowerCase().replace(/\s+/g, "_")

  if (normalizedStatus === "completed") {
    return "completed"
  }

  if (normalizedStatus === "in_progress") {
    return "in_progress"
  }

  if (normalizedStatus === "pending") {
    return "pending"
  }

  return "unknown"
}

export const getPlanTodoStatusLabel = (status: PlanTodoStatus): string => {
  switch (status) {
    case "completed":
      return "Completed"
    case "in_progress":
      return "In Progress"
    case "pending":
      return "Pending"
    default:
      return "Unknown"
  }
}

export const getPlanTodoStatusStyles = (status: PlanTodoStatus) => {
  switch (status) {
    case "completed":
      return {
        badgeClassName:
          "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
        dotClassName: "bg-emerald-500/90 dark:bg-emerald-400/90",
        textClassName: "text-foreground/75",
      }
    case "in_progress":
      return {
        badgeClassName: "border-primary/30 bg-primary/5 text-foreground",
        dotClassName: "bg-primary/80",
        textClassName: "text-foreground",
      }
    case "pending":
      return {
        badgeClassName: "border-border/70 text-muted-foreground",
        dotClassName: "bg-muted-foreground/40",
        textClassName: "text-foreground/80",
      }
    default:
      return {
        badgeClassName: "text-muted-foreground",
        dotClassName: "bg-muted-foreground/50",
        textClassName: "text-foreground",
      }
  }
}

export const summarizePlanTodos = (
  todos: Array<{
    status: string
  }>,
): PlanTodoSummary => {
  const summary = todos.reduce<PlanTodoSummary>(
    (accumulator, todo) => {
      const status = normalizePlanTodoStatus(todo.status)

      if (status === "completed") {
        accumulator.completed += 1
      } else if (status === "in_progress") {
        accumulator.in_progress += 1
      } else if (status === "pending") {
        accumulator.pending += 1
      }

      return accumulator
    },
    {
      completed: 0,
      in_progress: 0,
      pending: 0,
      total: todos.length,
    },
  )

  summary.total = todos.length
  return summary
}
