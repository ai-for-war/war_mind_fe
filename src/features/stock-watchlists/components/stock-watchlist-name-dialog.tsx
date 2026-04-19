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

type StockWatchlistNameDialogProps = {
  description: string
  error: string | null
  isPending?: boolean
  nameValue: string
  onNameChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  open: boolean
  submitLabel: string
  title: string
}

export const StockWatchlistNameDialog = ({
  description,
  error,
  isPending = false,
  nameValue,
  onNameChange,
  onOpenChange,
  onSubmit,
  open,
  submitLabel,
  title,
}: StockWatchlistNameDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <Field>
            <FieldLabel htmlFor="stock-watchlist-name">Name</FieldLabel>
            <FieldContent>
              <Input
                id="stock-watchlist-name"
                value={nameValue}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Tech"
                maxLength={255}
                aria-invalid={error ? "true" : undefined}
                autoFocus
              />
              <FieldDescription>
                Watchlist names are trimmed by the backend and must be unique per organization.
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
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
