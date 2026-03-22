import { CircleDot, Route, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const readinessItems = [
  {
    title: "Feature slice scaffolded",
    description:
      "The meeting recorder feature now has dedicated components, hooks, stores, services, reducers, types, constants, and utils folders.",
    icon: ShieldCheck,
  },
  {
    title: "Authenticated route wired",
    description:
      "This page mounts inside the protected application shell and shares the existing socket-enabled authenticated runtime.",
    icon: Route,
  },
  {
    title: "Sidebar entry available",
    description:
      "Users can reach the production meeting recorder surface directly from the authenticated navigation.",
    icon: CircleDot,
  },
] as const

export const MeetingRecorderPage = () => {
  return (
    <section className="flex flex-col gap-6 xl:min-h-0 xl:flex-1">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              Meeting Recorder
            </h1>
            <Badge variant="secondary">Scaffolded</Badge>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The authenticated entry point for the production meeting recorder is
            in place. Runtime orchestration, browser media capture, transcript
            handling, and AI note rendering will be added in the next tasks of
            this OpenSpec change.
          </p>
        </div>
      </header>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Page entry ready</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {readinessItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border/60 bg-muted/20 p-4"
            >
              <div className="flex items-center gap-2">
                <item.icon className="size-4 text-primary" />
                <h2 className="text-sm font-medium text-foreground">
                  {item.title}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
