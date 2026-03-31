import {
  AlertCircle,
  DatabaseZap,
  FileSearch,
  PlugZap,
  RefreshCcw,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

export const SkillPluginListLoadingState = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`skill-plugin-skeleton-${index}`}
          className="rounded-xl border border-border/60 bg-card/60 p-5"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-80 max-w-full" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-40 rounded-full" />
              <Skeleton className="h-9 w-52 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const SkillPluginListEmptyState = ({
  onCreate,
}: {
  onCreate: () => void
}) => {
  return (
    <Empty className="border border-dashed border-border/60 bg-card/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PlugZap className="size-5" />
        </EmptyMedia>
        <EmptyTitle>No skill plugins yet</EmptyTitle>
        <EmptyDescription>
          Create your first skill plugin to give the lead agent a focused,
          reusable capability.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onCreate}>
          Create your first skill
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export const SkillPluginListNoResultsState = ({
  onReset,
}: {
  onReset: () => void
}) => {
  return (
    <Empty className="border border-dashed border-border/60 bg-card/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileSearch className="size-5" />
        </EmptyMedia>
        <EmptyTitle>No matching skill plugins</EmptyTitle>
        <EmptyDescription>
          Adjust the current search or filter to see more results from your
          existing skill catalog.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export const SkillPluginListErrorState = ({
  onRetry,
}: {
  onRetry: () => void
}) => {
  return (
    <Alert variant="destructive" className="rounded-xl border-destructive/30">
      <AlertCircle className="size-4" />
      <AlertTitle>Failed to load skill plugins</AlertTitle>
      <AlertDescription>
        <p>
          The skill plugin list could not be loaded from the lead-agent API.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-3"
        >
          <RefreshCcw className="size-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export const SkillPluginListPlaceholderState = () => {
  return (
    <Empty className="border border-dashed border-border/60 bg-card/40">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseZap className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Preparing list data</EmptyTitle>
        <EmptyDescription>
          The page is waiting for the skill plugin query to resolve.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
