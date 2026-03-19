"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'

interface Subject {
  id: string
  name: string
  slug: string
  category: string
}

interface SubjectSelectProps {
  subjects: Record<string, Subject[]>
  selected: string[]
  onChange: (ids: string[]) => void
  onComplete: () => void
}

export function SubjectSelect({ subjects, selected, onChange, onComplete }: SubjectSelectProps) {
  const handleSelect = (id: string) => {
    onChange([id])
  }
  
  const categories = {
    'test-prep': 'Test Prep',
    'high-school': 'High School',
    'college': 'College',
    'elementary': 'Elementary'
  }

  const allSubjects = Object.values(subjects).flat()
  const selectedId = selected[0]
  const selectedSubject = selectedId ? allSubjects.find(s => s.id === selectedId) : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif text-[#1e293b]">Select Subject</h2>
        <span className="text-sm font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600">
          Choose one
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
                const isSelected = selectedId === subject.id
                return (
                  <div 
                    key={subject.id}
                    className={`flex items-center space-x-3 p-3 border rounded-md transition-colors cursor-pointer
                      ${isSelected ? 'border-[#517cad] bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                    onClick={() => handleSelect(subject.id)}
                  >
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => handleSelect(subject.id)}
                      className="rounded-full data-[state=checked]:bg-[#517cad] data-[state=checked]:border-[#517cad]"
                    />
                    <Label 
                      htmlFor={subject.id}
                      className="flex-1 font-medium text-sm cursor-pointer"
                    >
                      {subject.name}
                    </Label>
                  </div>
                )
              })}
             </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {selectedSubject && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-semibold text-[#1e293b]">{selectedSubject.name}</span>
          </p>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
         <Button onClick={onComplete} disabled={selected.length === 0} className="bg-[#1e293b]">Continue</Button>
      </div>
    </div>
  )
}
