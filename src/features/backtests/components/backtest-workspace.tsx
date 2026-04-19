"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getBacktestApiErrorMessage,
  getBacktestValidationErrors,
} from "@/features/backtests/backtest.utils"
import { BacktestResultPanel } from "@/features/backtests/components/backtest-result-panel"
import { BacktestSetupForm } from "@/features/backtests/components/backtest-setup-form"
import { useBacktestTemplates, useRunBacktest } from "@/features/backtests/hooks"
import type { BacktestResult, BacktestRunRequest } from "@/features/backtests/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type BacktestWorkspaceProps = {
  className?: string
  initialValues?: Partial<BacktestRunRequest>
}

const BacktestSetupSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-28 w-full rounded-xl" />
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-40 w-full rounded-xl" />
    <div className="flex justify-end">
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
  </div>
)

const hasValidationBacktestError = (error: unknown) => getBacktestValidationErrors(error).length > 0

export const BacktestWorkspace = ({
  className,
  initialValues,
}: BacktestWorkspaceProps) => {
  const [lastSuccessfulResult, setLastSuccessfulResult] = useState<BacktestResult | null>(null)
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<BacktestRunRequest | null>(null)
  const [isTransitionPending, startTransition] = useTransition()
  const lastTemplateErrorMessageRef = useRef<string | null>(null)
  const lastRunErrorMessageRef = useRef<string | null>(null)
  const backtestTemplatesQuery = useBacktestTemplates()
  const runBacktestMutation = useRunBacktest()

  const selectedResult = useMemo(
    () => runBacktestMutation.data?.result ?? lastSuccessfulResult,
    [lastSuccessfulResult, runBacktestMutation.data?.result],
  )

  const handleRunBacktest = async (request: BacktestRunRequest) => {
    setLastSubmittedRequest(request)
    const response = await runBacktestMutation.runBacktest(request)

    startTransition(() => {
      setLastSuccessfulResult(response.result)
    })
  }

  useEffect(() => {
    if (!backtestTemplatesQuery.isError) {
      lastTemplateErrorMessageRef.current = null
      return
    }

    const nextErrorMessage = getBacktestApiErrorMessage(backtestTemplatesQuery.error)

    if (lastTemplateErrorMessageRef.current === nextErrorMessage) {
      return
    }

    lastTemplateErrorMessageRef.current = nextErrorMessage
    toast.error(nextErrorMessage)
  }, [backtestTemplatesQuery.error, backtestTemplatesQuery.isError])

  useEffect(() => {
    if (!runBacktestMutation.isError) {
      lastRunErrorMessageRef.current = null
      return
    }

    const nextErrorMessage = getBacktestApiErrorMessage(runBacktestMutation.error)

    if (lastRunErrorMessageRef.current === nextErrorMessage) {
      return
    }

    lastRunErrorMessageRef.current = nextErrorMessage
    toast.error(nextErrorMessage)
  }, [runBacktestMutation.error, runBacktestMutation.isError])

  if (backtestTemplatesQuery.isLoading) {
    return (
      <div className={cn("grid min-h-0 flex-1 gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]", className)}>
        <div className="rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
          <BacktestSetupSkeleton />
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
          <BacktestResultPanel isPending />
        </div>
      </div>
    )
  }

  if (backtestTemplatesQuery.isError) {
    return (
      <div className={cn("flex min-h-0 flex-1", className)}>
        <Empty className="min-h-[420px] w-full border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Unable to load strategy templates</EmptyTitle>
            <EmptyDescription>
              The workspace needs the backend template catalog before a backtest can run.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={() => void backtestTemplatesQuery.refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </Empty>
      </div>
    )
  }

  if (backtestTemplatesQuery.items.length === 0) {
    return (
      <div className={cn("flex min-h-0 flex-1", className)}>
        <Empty className="min-h-[420px] w-full border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No backtest strategies available</EmptyTitle>
            <EmptyDescription>
              The backend template catalog is currently empty, so there is nothing to run yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="hidden min-h-0 min-w-0 flex-1 overflow-hidden xl:grid xl:grid-cols-[24rem_minmax(0,1fr)] xl:gap-4">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
          <div className="min-h-0 flex-1 overflow-y-auto pr-3">
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Setup</h2>
                <p className="text-sm text-muted-foreground">
                  Adjust inputs, pick a strategy, and run the backtest without leaving the current context.
                </p>
              </div>
              <BacktestSetupForm
                initialValues={lastSubmittedRequest ?? initialValues}
                isSubmitting={runBacktestMutation.isPending || isTransitionPending}
                onSubmit={handleRunBacktest}
                submissionError={hasValidationBacktestError(runBacktestMutation.error) ? runBacktestMutation.error : undefined}
                templates={backtestTemplatesQuery.items}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
          <div className="min-h-0 flex-1 overflow-y-auto pr-3">
            <BacktestResultPanel
              isPending={runBacktestMutation.isPending || isTransitionPending}
              result={selectedResult}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 xl:hidden">
        <div className="grid min-h-full min-w-0 gap-4 pr-3">
          <div className="min-w-0 rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
            <BacktestSetupForm
              initialValues={lastSubmittedRequest ?? initialValues}
              isSubmitting={runBacktestMutation.isPending || isTransitionPending}
              onSubmit={handleRunBacktest}
              submissionError={hasValidationBacktestError(runBacktestMutation.error) ? runBacktestMutation.error : undefined}
              templates={backtestTemplatesQuery.items}
            />
          </div>
          <div className="min-w-0 rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
            <BacktestResultPanel
              isPending={runBacktestMutation.isPending || isTransitionPending}
              result={selectedResult}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
