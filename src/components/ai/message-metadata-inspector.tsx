import { BotIcon, BoxesIcon, LayersIcon, WrenchIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import {
  ChainOfThoughtStep,
} from "@/components/ai/chain-of-thought"
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
