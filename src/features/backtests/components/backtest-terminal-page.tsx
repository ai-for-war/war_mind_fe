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
import { toast } from "sonner"

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

export const BacktestTerminalPage = () => {
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
      <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Backtest Terminal
          </h1>
          <p className="text-sm text-muted-foreground">
            Run one strategy on one symbol and inspect performance, equity, and trades.
          </p>
        </header>
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
            <BacktestSetupSkeleton />
          </div>
          <div className="rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
            <BacktestResultPanel isPending />
          </div>
        </div>
      </section>
    )
  }

  if (backtestTemplatesQuery.isError) {
    return (
      <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Backtest Terminal
          </h1>
          <p className="text-sm text-muted-foreground">
            Run one strategy on one symbol and inspect performance, equity, and trades.
          </p>
        </header>
        <Empty className="min-h-[420px] border-border/60 bg-background/20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle>Unable to load strategy templates</EmptyTitle>
            <EmptyDescription>
              The page needs the backend template catalog before a backtest can run.
            </EmptyDescription>
          </EmptyHeader>
          <Button type="button" variant="outline" onClick={() => void backtestTemplatesQuery.refetch()}>
            <RefreshCw />
            Retry
          </Button>
        </Empty>
      </section>
    )
  }

  if (backtestTemplatesQuery.items.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Backtest Terminal
          </h1>
          <p className="text-sm text-muted-foreground">
            Run one strategy on one symbol and inspect performance, equity, and trades.
          </p>
        </header>
        <Empty className="min-h-[420px] border-border/60 bg-background/20">
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
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 max-h-[calc(100dvh-6rem)] flex-1 flex-col gap-4 overflow-hidden">
      <header className="shrink-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Backtest Terminal
        </h1>
        <p className="text-sm text-muted-foreground">
          Run one strategy on one symbol and inspect performance, equity, and trades.
        </p>
      </header>

      <div className="hidden min-h-0 min-w-0 flex-1 overflow-hidden xl:grid xl:grid-cols-[24rem_minmax(0,1fr)] xl:gap-4">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-4 backdrop-blur">
          <div className="min-h-0 flex-1 overflow-y-auto pr-3">
            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Setup</h2>
                <p className="text-sm text-muted-foreground">
                  Adjust inputs, pick a strategy, and run the backtest without leaving the page.
                </p>
              </div>
              <BacktestSetupForm
                initialValues={lastSubmittedRequest ?? undefined}
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
              initialValues={lastSubmittedRequest ?? undefined}
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
    </section>
  )
}
