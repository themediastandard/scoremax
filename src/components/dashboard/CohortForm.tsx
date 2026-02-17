'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addWeeks, format, parseISO } from 'date-fns'

interface Cohort {
  id: string
  start_date: string
  end_date: string
  max_students: number
  enrolled_count: number
  status: string
  price_cents: number
}

interface CohortFormProps {
  cohort?: Cohort
}

export function CohortForm({ cohort }: CohortFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isEditing = !!cohort

  // Parse dates for input default value (yyyy-MM-dd)
  const defaultStart = cohort?.start_date ? format(parseISO(cohort.start_date), 'yyyy-MM-dd') : ''
  const defaultEnd = cohort?.end_date ? format(parseISO(cohort.end_date), 'yyyy-MM-dd') : ''

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)
  const [status, setStatus] = useState(cohort?.status || 'upcoming')

  // Auto-calculate end date (5 weeks) when start date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setStartDate(val)
    if (val && !isEditing) {
      try {
        const start = new Date(val)
        // Ensure date is valid
        if (!isNaN(start.getTime())) {
             const end = addWeeks(start, 5)
             setEndDate(format(end, 'yyyy-MM-dd'))
        }
      } catch (e) {
        console.error('Invalid date', e)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Manual form data construction because Select component doesn't output to FormData natively in some versions?
    // Shadcn Select uses hidden input if name is provided, but let's be safe.
    // Actually Radix Select doesn't render hidden input by default unless using a form library or manually handling value.
    // I'll manually get values.

    const data = {
      start_date: startDate,
      end_date: endDate,
      max_students: parseInt(formData.get('max_students') as string) || 15,
      price_cents: parseInt(formData.get('price_cents') as string) || 89500,
      status: status,
    }

    try {
      const url = isEditing ? `/api/admin/cohorts/${cohort?.id}` : '/api/admin/cohorts'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error('Failed to save cohort')
      }

      setOpen(false)
      router.refresh()
      if (!isEditing) {
        setStartDate('')
        setEndDate('')
        setStatus('upcoming')
      }
    } catch (error) {
      console.error(error)
      alert('Error saving cohort')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? 'ghost' : 'default'} className={isEditing ? 'text-[#517cad] hover:text-[#3b5c85]' : ''}>
          {isEditing ? 'Manage' : 'Create Cohort'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Cohort' : 'Create New Cohort'}</DialogTitle>
          <DialogDescription>
            Manage the In-Person SAT Course cohort details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input 
                id="start_date" 
                name="start_date" 
                type="date" 
                value={startDate} 
                onChange={handleStartDateChange} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input 
                id="end_date" 
                name="end_date" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="max_students">Max Students</Label>
              <Input 
                id="max_students" 
                name="max_students" 
                type="number" 
                defaultValue={cohort?.max_students ?? 15} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price_cents">Price (Cents)</Label>
              <Input 
                id="price_cents" 
                name="price_cents" 
                type="number" 
                defaultValue={cohort?.price_cents ?? 89500} 
                required 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
