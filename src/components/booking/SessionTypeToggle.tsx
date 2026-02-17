"use client"

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

interface SessionTypeToggleProps {
  value: 'online' | 'in-person'
  onChange: (value: 'online' | 'in-person') => void
}

export function SessionTypeToggle({ value, onChange }: SessionTypeToggleProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-serif text-[#1e293b]">How would you like to meet?</h2>
        <p className="text-gray-500 text-sm">Since you selected SAT prep, you have the option for in-person sessions at our Sawgrass location.</p>
      </div>
      
      <RadioGroup value={value} onValueChange={(v) => onChange(v as 'online' | 'in-person')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <RadioGroupItem value="online" id="online" className="peer sr-only" />
          <Label
            htmlFor="online"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#517cad] [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span className="text-lg font-semibold mb-2">Online (Zoom)</span>
            <span className="text-sm text-center text-gray-500">Flexible 1:1 sessions from anywhere</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem value="in-person" id="in-person" className="peer sr-only" />
          <Label
            htmlFor="in-person"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#517cad] [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <span className="text-lg font-semibold mb-2">In-Person (Sawgrass, FL)</span>
            <span className="text-sm text-center text-gray-500">Meet at our Sawgrass learning center</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}