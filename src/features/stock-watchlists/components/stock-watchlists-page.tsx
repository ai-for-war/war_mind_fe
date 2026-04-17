import { AlertCircle, FolderOpen, ListChecks } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useStockWatchlistsWorkspace } from "@/features/stock-watchlists/hooks"

const WatchlistsRouteSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
)

export const StockWatchlistsPage = () => {
  const {
    activeWatchlist,
    activeWatchlistId,
    activeWatchlistItemsQuery,
    setActiveWatchlistId,
    watchlistsQuery,
  } = useStockWatchlistsWorkspace()

  if (watchlistsQuery.isLoading) {
    return <WatchlistsRouteSkeleton />
  }

  if (watchlistsQuery.isError) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col gap-4">
        <header className="space-y-2">
          <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
            Markets
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlists</h1>
            <p className="text-sm text-muted-foreground">
              Organize research symbols in dedicated watchlists.
            </p>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-2xl border border-border/60 bg-background/40 p-6">
          <Empty className="border-destructive/30 bg-destructive/5">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="size-5 text-destructive" />
              </EmptyMedia>
              <EmptyTitle>Unable to load watchlists</EmptyTitle>
              <EmptyDescription>
                The route is available, but the watchlist summary request failed. Retry from the
                upcoming route workspace controls.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
            Markets
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-secondary/70">
            {watchlistsQuery.items.length} watchlists
          </Badge>
          {activeWatchlist ? (
            <Badge variant="outline" className="rounded-full border-border/60">
              Active {activeWatchlist.name}
            </Badge>
          ) : null}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Watchlists</h1>
          <p className="text-sm text-muted-foreground">
            Route shell and active-watchlist workspace state are in place for the watchlist UI.
          </p>
        </div>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <ListChecks className="size-4" />
            Watchlist Directory
          </div>
          {watchlistsQuery.items.length === 0 ? (
            <Empty className="border-border/60 bg-background/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No watchlists yet</EmptyTitle>
                <EmptyDescription>
                  Task 2 wires the route and selection state. Create and manage flows land in task
                  3.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-2">
              {watchlistsQuery.items.map((watchlist) => {
                const isActive = watchlist.id === activeWatchlistId

                return (
                  <button
                    key={watchlist.id}
                    type="button"
                    onClick={() => setActiveWatchlistId(watchlist.id)}
                    className={
                      isActive
                        ? "flex w-full flex-col items-start gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-3 text-left"
                        : "flex w-full flex-col items-start gap-1 rounded-xl border border-border/60 bg-background/20 px-3 py-3 text-left transition-colors hover:border-border hover:bg-background/40"
                    }
                  >
                    <span className="text-sm font-medium text-foreground">{watchlist.name}</span>
                    <span className="text-xs text-muted-foreground">{watchlist.updated_at}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <ListChecks className="size-4" />
            Active Watchlist Workspace
          </div>
          {activeWatchlist ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Selected watchlist: <span className="font-medium text-foreground">{activeWatchlist.name}</span>
              </p>
              <p>Active watchlist id: {activeWatchlist.id}</p>
              <p>
                Items query status:{" "}
                {activeWatchlistItemsQuery.isLoading
                  ? "loading"
                  : activeWatchlistItemsQuery.isError
                    ? "error"
                    : "ready"}
              </p>
            </div>
          ) : (
            <Empty className="border-border/60 bg-background/20">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No active watchlist</EmptyTitle>
                <EmptyDescription>
                  The workspace resets to the first available watchlist and clears when the list is
                  empty.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </section>
  )
}
