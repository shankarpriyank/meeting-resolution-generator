"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)
  const dateValue = value ? new Date(value) : internalDate

  const handleSelect = (date: Date | undefined) => {
    if (onChange && date) {
      onChange(format(date, 'yyyy-MM-dd'))
    } else {
      setInternalDate(date)
    }
    // Close the popover after selecting a date
    setOpen(false)
  }

  return (
    <div className="h-12">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={`h-12 w-full justify-between rounded-sm bg-[#0A0A0A] border-[#2A2A2A] text-white hover:bg-[#0A0A0A] hover:text-white hover:border-[#2A2A2A] focus:bg-[#0A0A0A] focus:text-white focus:border-[#2A2A2A] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-[#2A2A2A] active:bg-[#0A0A0A] active:text-white active:border-[#2A2A2A] aria-expanded:bg-[#0A0A0A] aria-expanded:text-white aria-expanded:border-[#2A2A2A] data-[empty=true]:text-gray-400 transition-none ${className || ''}`}
              data-empty={!dateValue}
            >
              <span className="font-normal">
                {dateValue ? format(dateValue, 'dd/MM/yyyy') : placeholder}
              </span>
              <CalendarIcon className="h-4 w-4 opacity-70" data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0 bg-[#2A2A2A] border-[#2A2A2A]" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            defaultMonth={dateValue}
            className="bg-[#2A2A2A] text-white"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
