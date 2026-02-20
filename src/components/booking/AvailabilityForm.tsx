"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

interface AvailabilityFormProps {
  value: {
    days: string[]
    startTime: string
    endTime: string
    timezone: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'
]

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

export function AvailabilityForm({ value, onChange }: AvailabilityFormProps) {
  const handleDayToggle = (day: string) => {
    const days = value.days.includes(day)
      ? value.days.filter(d => d !== day)
      : [...value.days, day]
    onChange({ ...value, days })
  }

  const handleChange = (field: string, val: string) => {
    onChange({ ...value, [field]: val })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-serif text-[#1e293b]">When are you available?</h2>
        <p className="text-gray-500 text-sm">Select the days and general times that work best for you. We&apos;ll match you with a tutor and confirm the exact time.</p>
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
                <p>You can select multiple days!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-wrap gap-3">
          {DAYS.map(day => {
            const isSelected = value.days.includes(day)
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
      
      {/* Time Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Earliest Start Time <span className="text-red-500">*</span></Label>
          <Select 
            value={value.startTime} 
            onValueChange={(val) => handleChange('startTime', val)}
          >
            <SelectTrigger id="startTime" className={`w-full ${!value.startTime ? 'border-red-300' : ''}`}>
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              viewportClassName="!h-[200px]"
              className="!max-h-[200px]"
            >
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={`start-${slot.value}`} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400">Between 7:00 AM and 10:00 PM</span>
        </div>
        <div>
          <Label htmlFor="endTime">Latest End Time <span className="text-red-500">*</span></Label>
          <Select 
            value={value.endTime} 
            onValueChange={(val) => handleChange('endTime', val)}
          >
            <SelectTrigger id="endTime" className={`w-full ${!value.endTime ? 'border-red-300' : ''}`}>
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent 
              position="popper" 
              viewportClassName="!h-[200px]"
              className="!max-h-[200px]"
            >
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={`end-${slot.value}`} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400">Must be at least 1 hour after start</span>
        </div>
      </div>
      
      {/* Timezone */}
      <div>
        <Label htmlFor="timezone">Your Timezone</Label>
        <Select value={value.timezone} onValueChange={(val) => handleChange('timezone', val)}>
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