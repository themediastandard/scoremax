"use client"

import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Subject {
  id: string
  name: string
  slug: string
  category: string
}

interface SubjectSelectProps {
  subjects: Record<string, Subject[]>
  selected: string[]
  onChange: (ids: string[], hasSAT: boolean) => void
  onComplete: () => void
}

export function SubjectSelect({ subjects, selected, onChange, onComplete }: SubjectSelectProps) {
  // Removed internal state for subjects

  const handleToggle = (id: string) => {
    let newSelected: string[]
    if (selected.includes(id)) {
      newSelected = selected.filter(s => s !== id)
    } else {
      // Allow more than 3? Prompt says max 3 in UI, let's keep it.
      if (selected.length >= 3) return
      newSelected = [...selected, id]
    }
    
    let hasSAT = false
    Object.values(subjects).forEach(list => {
      list.forEach(s => {
        if (newSelected.includes(s.id) && s.slug === 'sat') hasSAT = true
      })
    })
    
    onChange(newSelected, hasSAT)
  }
  
  const categories = {
    'test-prep': 'Test Prep',
    'high-school': 'High School',
    'college': 'College',
    'elementary': 'Elementary'
  }

  // Removed internal loading

  const allSubjects = Object.values(subjects).flat()
  const selectedSubjects = allSubjects.filter(s => selected.includes(s.id))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-[#1e293b]">Select Subject(s)</h2>
        <span className={`text-sm font-medium px-2 py-1 rounded-md ${selected.length === 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
          {selected.length}/3 Selected
        </span>
      </div>
      
      <Tabs defaultValue="test-prep" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          {Object.entries(categories).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs md:text-sm">{label}</TabsTrigger>
          ))}
        </TabsList>
        
        {Object.entries(categories).map(([key, _]) => (
          <TabsContent key={key} value={key} className="mt-0">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
              {subjects[key]?.map(subject => {
                const isSelected = selected.includes(subject.id)
                const isDisabled = !isSelected && selected.length >= 3
                
                return (
                  <div 
                    key={subject.id}
                    className={`flex items-center space-x-3 p-3 border rounded-md transition-colors 
                      ${isSelected ? 'border-[#517cad] bg-blue-50/30' : 'border-gray-200'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
                    `}
                    onClick={() => !isDisabled && handleToggle(subject.id)}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => !isDisabled && handleToggle(subject.id)}
                      disabled={isDisabled}
                      className="rounded-full data-[state=checked]:bg-[#517cad] data-[state=checked]:border-[#517cad]"
                    />
                    <Label className={`flex-1 font-medium text-sm ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      {subject.name}
                    </Label>
                  </div>
                )
              })}
             </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {selected.length === 3 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-md text-sm flex items-center">
          <span className="font-semibold mr-1">Limit Reached:</span> You have selected the maximum of 3 subjects. Remove one to add another.
        </div>
      )}

      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          {selectedSubjects.map(s => (
            <Badge key={s.id} variant="secondary" className="bg-blue-50 text-[#517cad] hover:bg-blue-100 pr-1 pl-2 py-1 flex items-center gap-1 rounded-full text-sm font-normal">
              {s.name}
              <button onClick={() => handleToggle(s.id)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                 <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex justify-end pt-4">
         <Button onClick={onComplete} disabled={selected.length === 0} className="bg-[#1e293b]">Continue</Button>
      </div>
    </div>
  )
}