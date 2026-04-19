"use client"

import { useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { BacktestTemplateItem } from "@/features/backtests/types"
import { normalizeBacktestTemplateId } from "@/features/backtests/types"
import { cn } from "@/lib/utils"

type BacktestStrategyPickerProps = {
  disabled?: boolean
  onChange: (templateId: string) => void
  templates: BacktestTemplateItem[]
  value?: string | null
}

export const BacktestStrategyPicker = ({
  disabled = false,
  onChange,
  templates,
  value,
}: BacktestStrategyPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const normalizedValue = normalizeBacktestTemplateId(value)
  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    if (!normalizedSearch) {
      return templates
    }

    return templates.filter((template) =>
      [
        template.template_id,
        template.display_name,
        template.description,
      ].some((field) => field.toLowerCase().includes(normalizedSearch)),
    )
  }, [searchValue, templates])
  const selectedTemplate =
    templates.find((template) => normalizeBacktestTemplateId(template.template_id) === normalizedValue) ?? null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedTemplate?.display_name ?? "Select strategy..."}
          </span>
          <ChevronsUpDownIcon data-icon="inline-end" className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search strategy..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No matching strategies found.</CommandEmpty>
            <CommandGroup heading="Strategies">
              {filteredTemplates.map((template) => (
                <CommandItem
                  key={template.template_id}
                  value={`${template.display_name} ${template.description}`}
                  onSelect={() => {
                    onChange(template.template_id)
                    setIsOpen(false)
                    setSearchValue("")
                  }}
                >
                  <CheckIcon
                    className={cn(
                      normalizeBacktestTemplateId(template.template_id) === normalizedValue
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium">{template.display_name}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {template.description}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
