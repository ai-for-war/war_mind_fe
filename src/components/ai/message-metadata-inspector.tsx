"use client"

import { BotIcon, BoxesIcon, ChevronDownIcon, LayersIcon, WrenchIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import {
  ChainOfThoughtStep,
} from "@/components/ai/chain-of-thought"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  formatAiToolArgumentsSummary,
  getAiToolTodoItems,
  getAiToolNavigationTarget,
  getAiToolPresentation,
} from "@/lib/ai-tool-presentation"
import type { NormalizedAssistantMessageMetadata } from "@/lib/ai-message-metadata"
import { cn } from "@/lib/utils"

type AiMessageMetadataInspectorProps = {
  className?: string
  description?: string
  metadata: NormalizedAssistantMessageMetadata | null
  title?: string
}

type MetadataSectionProps = {
  children: ReactNode
  className?: string
  icon: ComponentType<{ className?: string }>
  meta?: ReactNode
  title: string
}

type PlanTodoStatus = "completed" | "in_progress" | "pending" | "unknown"

const MetadataPill = ({
  children,
  className,
  variant = "secondary",
}: {
  children: ReactNode
  className?: string
  variant?: "outline" | "secondary"
}) => (
  <Badge
    className={cn(
      "max-w-full rounded-md px-2.5 py-1 font-medium text-sm break-all whitespace-normal",
      className,
    )}
    variant={variant}
  >
    {children}
  </Badge>
)

const MetadataSection = ({
  children,
  className,
  icon: Icon,
  meta,
  title,
}: MetadataSectionProps) => (
  <section className={cn("space-y-3", className)}>
    <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <span className="truncate font-medium text-foreground">{title}</span>
      </div>
      {meta ? <div className="shrink-0">{meta}</div> : null}
    </div>
    {children}
  </section>
)

const normalizePlanTodoStatus = (status: string): PlanTodoStatus => {
  const normalizedStatus = status.trim().toLowerCase().replace(/\s+/g, "_")

  if (normalizedStatus === "completed") {
    return "completed"
  }

  if (normalizedStatus === "in_progress") {
    return "in_progress"
  }

  if (normalizedStatus === "pending") {
    return "pending"
  }

  return "unknown"
}

const getPlanTodoStatusLabel = (status: PlanTodoStatus): string => {
  switch (status) {
    case "completed":
      return "Completed"
    case "in_progress":
      return "In Progress"
    case "pending":
      return "Pending"
    default:
      return "Unknown"
  }
}

const getPlanTodoStatusStyles = (status: PlanTodoStatus) => {
  switch (status) {
    case "completed":
      return {
        badgeClassName:
          "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200",
        dotClassName: "bg-emerald-400/90",
        textClassName: "text-foreground/80",
      }
    case "in_progress":
      return {
        badgeClassName: "border-primary/30 text-foreground",
        dotClassName: "bg-primary/80",
        textClassName: "text-foreground",
      }
    case "pending":
      return {
        badgeClassName: "border-border/70 text-muted-foreground",
        dotClassName: "bg-muted-foreground/40",
        textClassName: "text-foreground",
      }
    default:
      return {
        badgeClassName: "text-muted-foreground",
        dotClassName: "bg-muted-foreground/50",
        textClassName: "text-foreground",
      }
  }
}

export const AiMessageMetadataInspector = ({
  className,
  description = "Model, skill, and tools used for this response.",
  metadata,
  title = "Response metadata",
}: AiMessageMetadataInspectorProps) => {
  if (!metadata) {
    return null
  }

  const hasSkillSection = Boolean(
    metadata.skillId || metadata.skillVersion || metadata.loadedSkills.length > 0,
  )

  return (
    <Card className={cn("h-full gap-0 overflow-hidden", className)}>
      <CardHeader className="border-b pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="space-y-5 py-5">
          {metadata.model ? (
            <MetadataSection icon={BotIcon} title="Model">
              <MetadataPill className="font-mono text-[13px] tracking-[-0.01em]">
                {metadata.model}
              </MetadataPill>
            </MetadataSection>
          ) : null}

          {metadata.model && (hasSkillSection || metadata.toolCalls.length > 0) ? <Separator /> : null}

          {hasSkillSection ? (
            <MetadataSection
              icon={LayersIcon}
              meta={
                metadata.loadedSkills.length > 0 ? (
                  <Badge variant="outline">{metadata.loadedSkills.length} loaded</Badge>
                ) : undefined
              }
              title="Skill"
            >
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                {metadata.skillId ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <MetadataPill
                      className="font-mono text-[13px] tracking-[-0.01em]"
                      variant="outline"
                    >
                      {metadata.skillId}
                    </MetadataPill>
                    {metadata.skillVersion ? (
                      <Badge variant="secondary">v{metadata.skillVersion}</Badge>
                    ) : null}
                  </div>
                ) : null}

                {metadata.loadedSkills.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <BoxesIcon className="size-3.5" />
                      <span>Loaded skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.loadedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </MetadataSection>
          ) : null}

          {hasSkillSection && metadata.toolCalls.length > 0 ? <Separator /> : null}

          {metadata.toolCalls.length > 0 ? (
            <MetadataSection
              icon={WrenchIcon}
              meta={<Badge variant="outline">{metadata.toolCalls.length}</Badge>}
              title="Tools"
            >
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                {metadata.toolCalls.map((toolCall, index) => {
                  const presentation = getAiToolPresentation(toolCall.name)
                  const summary = formatAiToolArgumentsSummary(toolCall.name, toolCall.arguments)
                  const planTodos = getAiToolTodoItems(toolCall.name, toolCall.arguments)
                  const isPlanTool = planTodos.length > 0
                  const navigationTarget = getAiToolNavigationTarget(
                    toolCall.name,
                    toolCall.arguments,
                  )
                  const isNavigable = Boolean(navigationTarget)
                  const content = (
                    <>
                      <div
                        className={cn(
                          "font-medium text-foreground transition-colors",
                          isNavigable && "group-hover:text-primary group-focus-visible:text-primary",
                        )}
                      >
                        {presentation.label}
                      </div>
                      {summary ? (
                        <div
                          className={cn(
                            "text-muted-foreground text-xs transition-colors",
                            isNavigable &&
                              "group-hover:text-primary/80 group-focus-visible:text-primary/80",
                          )}
                        >
                          {summary}
                        </div>
                      ) : null}
                    </>
                  )

                  if (isPlanTool) {
                    return (
                      <ChainOfThoughtStep
                        className={cn(
                          "gap-3 text-sm [&>div:last-child]:min-w-0 [&>div:last-child]:overflow-hidden [&_svg]:shrink-0",
                          index === metadata.toolCalls.length - 1
                            ? "[&>div:first-child>div]:hidden"
                            : "[&>div:first-child>div]:block",
                        )}
                        icon={presentation.icon}
                        key={toolCall.id}
                        label={
                          <Collapsible>
                            <CollapsibleTrigger
                              className="group flex w-full items-start gap-3 rounded-md py-0.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="font-medium text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
                                  {presentation.label}
                                </div>
                                {summary ? (
                                  <div className="text-muted-foreground text-xs transition-colors group-hover:text-primary/80 group-focus-visible:text-primary/80">
                                    {summary}
                                  </div>
                                ) : null}
                              </div>
                              <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>

                            <CollapsibleContent
                              className={cn(
                                "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 overflow-hidden pt-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
                              )}
                            >
                              <div className="space-y-2 pl-0.5">
                                {planTodos.map((todo, todoIndex) => {
                                  const status = normalizePlanTodoStatus(todo.status)
                                  const statusStyles = getPlanTodoStatusStyles(status)

                                  return (
                                    <div
                                      className="flex items-start gap-2.5 rounded-md border border-border/50 bg-background/40 px-2.5 py-2"
                                      key={`${toolCall.id}-${todoIndex}-${todo.content}`}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={cn(
                                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                                          statusStyles.dotClassName,
                                        )}
                                      />
                                      <div className="min-w-0 flex-1">
                                        <div
                                          className={cn(
                                            "text-sm leading-5",
                                            statusStyles.textClassName,
                                          )}
                                        >
                                          {todo.content}
                                        </div>
                                      </div>
                                      <Badge
                                        className={cn(
                                          "shrink-0 rounded-md px-2 py-0.5 font-normal text-[11px]",
                                          statusStyles.badgeClassName,
                                        )}
                                        variant="outline"
                                      >
                                        {getPlanTodoStatusLabel(status)}
                                      </Badge>
                                    </div>
                                  )
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        }
                        status="complete"
                      />
                    )
                  }

                  return (
                    <ChainOfThoughtStep
                      className={cn(
                        "gap-3 text-sm [&>div:last-child]:min-w-0 [&>div:last-child]:overflow-hidden [&>div:last-child>div:last-child]:break-all [&>div:last-child>div:last-child]:whitespace-normal [&_svg]:shrink-0",
                        isNavigable &&
                          "group cursor-pointer [&>div:first-child]:transition-colors [&>div:first-child]:group-hover:text-primary [&>div:first-child]:group-focus-visible:text-primary",
                        index === metadata.toolCalls.length - 1
                          ? "[&>div:first-child>div]:hidden"
                          : "[&>div:first-child>div]:block",
                      )}
                      icon={presentation.icon}
                      key={toolCall.id}
                      label={
                        navigationTarget ? (
                          <a
                            className="block rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                            href={navigationTarget}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {content}
                          </a>
                        ) : (
                          content
                        )
                      }
                      status="complete"
                    />
                  )
                })}
              </div>
            </MetadataSection>
          ) : null}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
