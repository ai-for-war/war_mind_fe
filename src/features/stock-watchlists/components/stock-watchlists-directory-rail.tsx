import { Clock3, FolderOpen, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { StockWatchlistSummary } from "@/features/stock-watchlists/types"
import { formatStockWatchlistDateTime } from "@/features/stock-watchlists/stock-watchlists.utils"

type StockWatchlistsDirectoryRailProps = {
  activeWatchlistId: string | null
  isCreatePending?: boolean
  onCreateWatchlist: () => void
  onSelectWatchlist: (watchlistId: string) => void
  watchlists: StockWatchlistSummary[]
}

export const StockWatchlistsDirectoryRail = ({
  activeWatchlistId,
  isCreatePending = false,
  onCreateWatchlist,
  onSelectWatchlist,
  watchlists,
}: StockWatchlistsDirectoryRailProps) => {
  return (
    <aside className="flex min-h-0 flex-col rounded-2xl border border-border/60 bg-background/45">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
            My Watchlists
          </h2>
          <p className="text-xs text-muted-foreground">{watchlists.length} saved lists</p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={onCreateWatchlist}
          disabled={isCreatePending}
          aria-label="Create watchlist"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 p-3">
          {watchlists.map((watchlist) => {
            const isActive = watchlist.id === activeWatchlistId

            return (
              <button
                key={watchlist.id}
                type="button"
                onClick={() => onSelectWatchlist(watchlist.id)}
                className={
                  isActive
                    ? "flex w-full flex-col items-start gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-3 text-left shadow-sm"
                    : "flex w-full flex-col items-start gap-2 rounded-xl border border-border/60 bg-background/30 px-3 py-3 text-left transition-colors hover:border-border hover:bg-background/50"
                }
              >
                <span className="line-clamp-1 text-sm font-medium text-foreground">
                  {watchlist.name}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  Updated {formatStockWatchlistDateTime(watchlist.updated_at)}
                </span>
              </button>
            )
          })}

          {watchlists.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/20 px-4 py-8 text-center">
              <FolderOpen className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No watchlists yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first watchlist to start organizing symbols.
              </p>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </aside>
  )
}
