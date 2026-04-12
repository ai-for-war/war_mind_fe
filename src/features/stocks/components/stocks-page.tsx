import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const StocksPage = () => {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100">
          Markets
        </Badge>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stock Catalog</h1>
          <p className="text-sm text-muted-foreground">
            Feature scaffold initialized for the stock discovery workspace.
          </p>
        </div>
      </div>

      <Card className="border-border/60 bg-background/55 backdrop-blur">
        <CardHeader>
          <CardTitle>Foundation Ready</CardTitle>
          <CardDescription>
            The stocks feature module, filter constants, and table primitive are in place for the
            next implementation tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Task 1 focuses on setup only. Query wiring, filters, and the infinite-scroll table will
          be added in the next tasks.
        </CardContent>
      </Card>
    </section>
  )
}
