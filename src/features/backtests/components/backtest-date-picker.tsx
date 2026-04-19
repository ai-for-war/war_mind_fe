"use client"

import { CalendarIcon } from "lucide-react"
import { format, isValid, parse } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type BacktestDatePickerProps = {
  id: string
  value?: string
  placeholder: string
  disabled?: boolean
  invalid?: boolean
  onChange: (value: string) => void
}

const DATE_FORMAT = "yyyy-MM-dd"

const parseBacktestDateValue = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsedDate = parse(value, DATE_FORMAT, new Date())

  return isValid(parsedDate) ? parsedDate : undefined
}

export const BacktestDatePicker = ({
  id,
  value,
  placeholder,
  disabled = false,
  invalid = false,
  onChange,
}: BacktestDatePickerProps) => {
  const selectedDate = parseBacktestDateValue(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid ? true : undefined}
          className={cn(
            "w-full justify-between font-normal",
            !selectedDate && "text-muted-foreground",
          )}
        >
          {selectedDate ? format(selectedDate, DATE_FORMAT) : placeholder}
          <CalendarIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              return
            }

            onChange(format(date, DATE_FORMAT))
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
