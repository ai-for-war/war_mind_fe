"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BacktestWorkspace } from "@/features/backtests/components/backtest-workspace"
import type { BacktestRunRequest } from "@/features/backtests/types"

type BacktestDialogProps = {
  initialValues?: Partial<BacktestRunRequest>
  onOpenChange: (open: boolean) => void
  open: boolean
}

const buildDialogContentKey = (initialValues?: Partial<BacktestRunRequest>) =>
  [
    initialValues?.symbol?.trim().toUpperCase() ?? "",
    initialValues?.date_from?.trim() ?? "",
    initialValues?.date_to?.trim() ?? "",
    initialValues?.template_id?.trim().toLowerCase() ?? "",
  ].join(":")

export const BacktestDialog = ({
  initialValues,
  onOpenChange,
  open,
}: BacktestDialogProps) => {
  const dialogTitle = initialValues?.symbol?.trim()
    ? `Backtest ${initialValues.symbol.trim().toUpperCase()}`
    : "Backtest"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[88vh] w-[96vw] max-w-[96vw] overflow-hidden border-border/60 bg-background/95 p-0 backdrop-blur-xl sm:w-[min(96vw,96rem)] sm:max-w-[min(96vw,96rem)]"
        showCloseButton
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div
          key={buildDialogContentKey(initialValues)}
          className="flex h-full min-h-0 flex-col p-6 pt-14"
        >
          <BacktestWorkspace initialValues={initialValues} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
