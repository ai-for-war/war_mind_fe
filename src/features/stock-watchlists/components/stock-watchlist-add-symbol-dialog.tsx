import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type StockWatchlistAddSymbolDialogProps = {
  error: string | null
  isPending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  onSymbolChange: (value: string) => void
  open: boolean
  symbolValue: string
  watchlistName: string
}

export const StockWatchlistAddSymbolDialog = ({
  error,
  isPending = false,
  onOpenChange,
  onSubmit,
  onSymbolChange,
  open,
  symbolValue,
  watchlistName,
}: StockWatchlistAddSymbolDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Symbol</DialogTitle>
          <DialogDescription>
            Add a symbol directly to <span className="font-medium text-foreground">{watchlistName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <Field>
            <FieldLabel htmlFor="stock-watchlist-symbol">Symbol</FieldLabel>
            <FieldContent>
              <Input
                id="stock-watchlist-symbol"
                value={symbolValue}
                onChange={(event) => onSymbolChange(event.target.value)}
                placeholder="FPT"
                maxLength={32}
                aria-invalid={error ? "true" : undefined}
                autoCapitalize="characters"
                autoFocus
              />
              <FieldDescription>
                The backend normalizes symbol casing and rejects duplicates or missing symbols.
              </FieldDescription>
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Add Symbol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
