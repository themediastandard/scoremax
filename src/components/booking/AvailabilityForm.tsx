"use client"

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { DAY_NAMES, type AvailabilityWindow } from '@/lib/availability-windows'

interface AvailabilityValue {
  windows: AvailabilityWindow[]
  timezone: string
}

interface AvailabilityFormProps {
  value: AvailabilityValue
  studentName: string
  onChange: (value: AvailabilityValue) => void
}

const DAYS = DAY_NAMES

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'
]

/**
 * Every selected day needs a complete, ordered range before the booking can go
 * anywhere: the server drops windows it cannot use, so a half-filled day would
 * silently vanish from the request rather than fail loudly.
 */
export function isAvailabilityReady(windows: AvailabilityWindow[]): boolean {
  return (
    windows.length > 0 &&
    windows.every((w) => Boolean(w.start) && Boolean(w.end) && w.end > w.start)
  )
}

// Helper function to generate time slots
const TIME_SLOTS = (() => {
  const slots = []
  const startHour = 7 // 7 AM
  const endHour = 22 // 10 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    const suffix = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    const timeStr = `${h12}:00 ${suffix}`
    const time24 = `${hour.toString().padStart(2, '0')}:00`

    slots.push({ label: timeStr, value: time24 })

    // Half hour (e.g. 7:30 AM), unless it's the very end 10pm (if we want to stop exactly at 10)
    if (hour < endHour) {
       const timeStr30 = `${h12}:30 ${suffix}`
       const time24_30 = `${hour.toString().padStart(2, '0')}:30`
       slots.push({ label: timeStr30, value: time24_30 })
    }
  }
  return slots
})()

/** Keeps the stored order Monday-first however the day buttons were clicked. */
function sortByWeekday(windows: AvailabilityWindow[]): AvailabilityWindow[] {
  return [...windows].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
}

export function AvailabilityForm({ value, studentName, onChange }: AvailabilityFormProps) {
  const windows = value.windows
  const selectedDays = new Set(windows.map((w) => w.day))

  const handleDayToggle = (day: string) => {
    if (selectedDays.has(day)) {
      onChange({ ...value, windows: windows.filter((w) => w.day !== day) })
      return
    }
    // Seed a new day from the last day already filled in. Most students want
    // the same range on every day, and re-picking two times per day would make
    // the common case worse than the single shared range this replaced.
    const template = [...windows].reverse().find((w) => w.start && w.end)
    onChange({
      ...value,
      windows: sortByWeekday([
        ...windows,
        { day, start: template?.start ?? '', end: template?.end ?? '' },
      ]),
    })
  }

  const handleWindowChange = (day: string, field: 'start' | 'end', val: string) => {
    onChange({
      ...value,
      windows: windows.map((w) => (w.day === day ? { ...w, [field]: val } : w)),
    })
  }

  const applyFirstToAll = () => {
    const first = windows[0]
    if (!first?.start || !first?.end) return
    onChange({
      ...value,
      windows: windows.map((w) => ({ ...w, start: first.start, end: first.end })),
    })
  }

  const canApplyToAll =
    windows.length > 1 &&
    Boolean(windows[0]?.start && windows[0]?.end) &&
    windows.some((w) => w.start !== windows[0].start || w.end !== windows[0].end)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-serif text-[#1e293b]">Choose a time for {studentName}</h2>
        <p className="text-gray-500 text-sm">Pick your days, then set the times that work for each one. We&apos;ll match you with a tutor and confirm the exact time.</p>
      </div>

      {/* Days */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Label className="text-base font-semibold">Preferred Days</Label>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p>You can select multiple days, each with its own times!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap gap-3">
          {DAYS.map(day => {
            const isSelected = selectedDays.has(day)
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                  ${isSelected
                    ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Per-day time ranges */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <Label className="text-base font-semibold">
            Times For Each Day <span className="text-red-500">*</span>
          </Label>
          {canApplyToAll && (
            <button
              type="button"
              onClick={applyFirstToAll}
              className="text-xs font-medium text-[#4a729f] hover:text-[#3b5c85] underline underline-offset-2"
            >
              Use {windows[0].day}&apos;s times for every day
            </button>
          )}
        </div>

        {windows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
            Select at least one day above to set your times.
          </div>
        ) : (
          <div className="space-y-3">
            {windows.map((window) => {
              const isOrdered = !window.start || !window.end || window.end > window.start
              return (
                <div
                  key={window.day}
                  className="rounded-lg border border-gray-200 bg-white p-4 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_1fr] gap-3 sm:items-center">
                    <span className="text-sm font-semibold text-[#1e293b]">{window.day}</span>
                    <div>
                      <Label htmlFor={`start-${window.day}`} className="text-xs text-gray-500">
                        Earliest start
                      </Label>
                      <Select
                        value={window.start}
                        onValueChange={(val) => handleWindowChange(window.day, 'start', val)}
                      >
                        <SelectTrigger
                          id={`start-${window.day}`}
                          className={`w-full ${!window.start ? 'border-red-300' : ''}`}
                        >
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          viewportClassName="!h-[200px]"
                          className="!max-h-[200px]"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={`start-${window.day}-${slot.value}`} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`end-${window.day}`} className="text-xs text-gray-500">
                        Latest end
                      </Label>
                      <Select
                        value={window.end}
                        onValueChange={(val) => handleWindowChange(window.day, 'end', val)}
                      >
                        <SelectTrigger
                          id={`end-${window.day}`}
                          className={`w-full ${!window.end || !isOrdered ? 'border-red-300' : ''}`}
                        >
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          viewportClassName="!h-[200px]"
                          className="!max-h-[200px]"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={`end-${window.day}-${slot.value}`} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {!isOrdered && (
                    <p className="text-xs text-red-500">
                      The end time must be after the start time.
                    </p>
                  )}
                </div>
              )
            })}
            <span className="block text-xs text-gray-400">Between 7:00 AM and 10:00 PM</span>
          </div>
        )}
      </div>

      {/* Timezone */}
      <div>
        <Label htmlFor="timezone">Your Timezone</Label>
        <Select value={value.timezone} onValueChange={(val) => onChange({ ...value, timezone: val })}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(tz => (
              <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
