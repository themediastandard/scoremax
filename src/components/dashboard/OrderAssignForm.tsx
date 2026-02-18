"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OrderAssignForm({ order, tutors }: { order: any, tutors: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [tutorId, setTutorId] = useState(order.assigned_tutor_id || '')
  const [date, setDate] = useState(order.confirmed_start ? new Date(order.confirmed_start).toISOString().split('T')[0] : '')
  const [time, setTime] = useState(order.confirmed_start ? new Date(order.confirmed_start).toTimeString().substring(0, 5) : '')
  const [duration, setDuration] = useState(() => {
    if (order.confirmed_start && order.confirmed_end) {
      const diff = (new Date(order.confirmed_end).getTime() - new Date(order.confirmed_start).getTime()) / 60000
      return String(diff)
    }
    return '60'
  })
  const [status, setStatus] = useState(order.status)
  const [internalNotes, setInternalNotes] = useState(order.internal_notes || '')

  const initial = useMemo(() => ({
    tutorId: order.assigned_tutor_id || '',
    date: order.confirmed_start ? new Date(order.confirmed_start).toISOString().split('T')[0] : '',
    time: order.confirmed_start ? new Date(order.confirmed_start).toTimeString().substring(0, 5) : '',
    duration: order.confirmed_start && order.confirmed_end
      ? String((new Date(order.confirmed_end).getTime() - new Date(order.confirmed_start).getTime()) / 60000)
      : '60',
    status: order.status,
    internalNotes: order.internal_notes || '',
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  const hasChanges = tutorId !== initial.tutorId
    || date !== initial.date
    || time !== initial.time
    || duration !== initial.duration
    || status !== initial.status
    || internalNotes !== initial.internalNotes

  const handleReset = () => {
    setTutorId(initial.tutorId)
    setDate(initial.date)
    setTime(initial.time)
    setDuration(initial.duration)
    setStatus(initial.status)
    setInternalNotes(initial.internalNotes)
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Construct confirmed_start/end
    let confirmedStart = null
    let confirmedEnd = null
    
    if (date && time) {
      const start = new Date(`${date}T${time}:00`) // Simplified timezone handling (using local/browser for now or UTC if server)
      // Ideally manage timezone explicitly
      confirmedStart = start.toISOString()
      
      const end = new Date(start.getTime() + Number(duration) * 60 * 1000)
      confirmedEnd = end.toISOString()
    }
    
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_tutor_id: tutorId || null,
          confirmed_start: confirmedStart,
          confirmed_end: confirmedEnd,
          status,
          internal_notes: internalNotes
        })
      })
      
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to update')
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      alert('Error updating order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Assign Tutor</Label>
          <Select value={tutorId} onValueChange={setTutorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tutor" />
            </SelectTrigger>
            <SelectContent>
              {tutors.map((tutor: any) => (
                <SelectItem key={tutor.id} value={tutor.id}>{tutor.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Confirmed Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <Label>Confirmed Time</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Internal Notes</Label>
        <Textarea 
          value={internalNotes} 
          onChange={(e) => setInternalNotes(e.target.value)} 
          placeholder="Private notes for admin team..." 
        />
      </div>
      
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 w-48">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="active">Active (Confirmed)</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <>
              <span className="flex items-center gap-1.5 text-xs text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
              <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
                Undo
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={loading} className="bg-[#1e293b]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}