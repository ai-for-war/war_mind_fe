import { BacktestWorkspace } from "@/features/backtests/components/backtest-workspace"

export const BacktestTerminalPage = () => {
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
      <BacktestWorkspace />
    </section>
  )
}
