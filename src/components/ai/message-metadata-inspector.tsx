"use client"

import {
  BotIcon,
  BoxesIcon,
  ChevronDownIcon,
  GitBranchIcon,
  LayersIcon,
  WrenchIcon,
} from "lucide-react"
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
import {
  getPlanTodoStatusLabel,
  getPlanTodoStatusStyles,
  normalizePlanTodoStatus,
  type PlanTodoStatus,
} from "@/common/plan-todo"
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

const PlanTodoStatusDot = ({ status }: { status: PlanTodoStatus }) => {
  const { dotClassName } = getPlanTodoStatusStyles(status)

  if (status === "in_progress") {
    return (
      <span aria-hidden="true" className="relative mt-1.5 size-2.5 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
        <span className={cn("absolute inset-0 m-auto size-1.5 rounded-full", dotClassName)} />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dotClassName)}
    />
  )
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
  const hasOrchestrationSection = Boolean(
    metadata.subagentEnabled !== null ||
      metadata.orchestrationMode ||
      metadata.delegationDepth !== null,
  )
  const orchestrationModeLabel =
    metadata.orchestrationMode === "subagent"
      ? "Subagent"
      : metadata.orchestrationMode === "direct"
        ? "Direct"
        : metadata.orchestrationMode
  const delegationDepthLabel =
    metadata.delegationDepth === null
      ? null
      : metadata.delegationDepth > 0
        ? `Worker run (${metadata.delegationDepth})`
        : null
  const orchestrationSummary = [
    metadata.subagentEnabled === true ? "Subagent orchestration was enabled for this response." : null,
    metadata.subagentEnabled === false ? "Subagent orchestration was disabled for this response." : null,
    orchestrationModeLabel ? `Mode: ${orchestrationModeLabel}.` : null,
    delegationDepthLabel ? `Depth: ${delegationDepthLabel}.` : null,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")

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

          {metadata.model &&
          (hasOrchestrationSection || hasSkillSection || metadata.toolCalls.length > 0) ? (
            <Separator />
          ) : null}

          {hasOrchestrationSection ? (
            <MetadataSection icon={GitBranchIcon} title="Orchestration">
              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/15 p-3">
                <div className="flex flex-wrap gap-2">
                  {metadata.subagentEnabled !== null ? (
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs",
                        metadata.subagentEnabled
                          ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/15"
                          : "border-border/70 bg-background/70 text-muted-foreground hover:bg-background/70",
                      )}
                      variant="outline"
                    >
                      {metadata.subagentEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  ) : null}

                  {orchestrationModeLabel ? (
                    <Badge
                      className="rounded-full border-border/70 bg-background/70 px-2.5 py-0.5 text-xs text-foreground hover:bg-background/70"
                      variant="outline"
                    >
                      {orchestrationModeLabel}
                    </Badge>
                  ) : null}

                  {delegationDepthLabel ? (
                    <Badge
                      className="rounded-full border-border/70 bg-background/70 px-2.5 py-0.5 text-xs text-foreground hover:bg-background/70"
                      variant="outline"
                    >
                      {delegationDepthLabel}
                    </Badge>
                  ) : null}
                </div>

                {orchestrationSummary ? (
                  <p className="text-xs leading-5 text-muted-foreground">
                    {orchestrationSummary}
                  </p>
                ) : null}
              </div>
            </MetadataSection>
          ) : null}

          {hasOrchestrationSection && (hasSkillSection || metadata.toolCalls.length > 0) ? <Separator /> : null}

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
                          "group cursor-pointer [&>div:first-child]:transition-colors [&>div:first-child]:group-hover:text-primary",
                          index === metadata.toolCalls.length - 1
                            ? "[&>div:first-child>div]:hidden"
                            : "[&>div:first-child>div]:block",
                        )}
                        icon={presentation.icon}
                        key={toolCall.id}
                        label={
                          <Collapsible>
                            <CollapsibleTrigger
                              className="flex w-full cursor-pointer items-start gap-3 rounded-md py-0.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
                                      <PlanTodoStatusDot status={status} />
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
