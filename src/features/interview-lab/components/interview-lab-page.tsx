import { AudioLines, Chrome, ShieldCheck, Waves } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const readinessItems = [
  {
    title: "Authenticated shell",
    description: "This route is mounted inside the protected application layout.",
    icon: ShieldCheck,
  },
  {
    title: "Chromium session",
    description: "Phase one expects Chromium tab capture for the interviewer lane.",
    icon: Chrome,
  },
  {
    title: "Realtime transport",
    description: "The page will bind to the shared Socket.IO runtime in the next tasks.",
    icon: Waves,
  },
]

const scaffoldModules = [
  "components",
  "hooks",
  "stores",
  "services",
  "reducers",
  "types",
  "constants",
  "utils",
]

export const InterviewLabPage = () => {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
            Scaffold Ready
          </Badge>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white lg:text-3xl">
              Interview Lab
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Dedicated workspace for the realtime interview assistant runtime, route wiring,
              and dual-source browser capture flow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AudioLines className="size-4 text-emerald-300" />
          Browser session and runtime controls land here as the remaining tasks are implemented.
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>Runtime Readiness</CardTitle>
            <CardDescription>
              The page is now reachable from the authenticated app shell and prepared for the
              interview runtime layers that follow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {readinessItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/60 bg-muted/20 p-4"
              >
                <item.icon className="size-5 text-emerald-300" />
                <h2 className="mt-3 text-sm font-medium text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-2">
            <CardTitle>Feature Slice</CardTitle>
            <CardDescription>
              Interview lab now has a dedicated home under <code>src/features/interview-lab</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {scaffoldModules.map((moduleName) => (
              <Badge key={moduleName} variant="secondary" className="px-3 py-1">
                {moduleName}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

