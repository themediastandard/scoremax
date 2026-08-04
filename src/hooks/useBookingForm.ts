import { useState } from 'react'
import type { AvailabilityWindow } from '@/lib/availability-windows'

export interface BookingState {
  subjects: string[]
  // Every session is delivered online. In-person tutoring was withdrawn as a
  // service before launch, so this is a constant rather than a choice — it is
  // kept as a field because `session_type` is still a column on
  // `booking_requests` and `sessions`.
  sessionType: 'online'
  availability: {
    // One entry per selected day, each with its own range, so "Mon 4–6pm, Thu
    // 9–11am" is expressible. Replaced a single {days, startTime, endTime}
    // triple that forced one range across every day. `start`/`end` are "HH:MM"
    // and may be empty while the student is still filling the day in.
    windows: AvailabilityWindow[]
    timezone: string
  }
  contact: {
    fullName: string
    email: string
    phone: string
    studentGrade: string
    notes: string
  }
}

export const useBookingForm = () => {
  const [state, setState] = useState<BookingState>({
    subjects: [],
    sessionType: 'online',
    availability: {
      windows: [],
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
    },
    contact: {
      fullName: '',
      email: '',
      phone: '',
      studentGrade: '',
      notes: ''
    }
  })

  const [revealed, setRevealed] = useState({
    subjects: true,
    availability: false,
    contact: false,
    plan: false
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memberStatus, setMemberStatus] = useState<any>(null)
  
  const updateSubjects = (subjects: string[]) => {
    setState(prev => ({ ...prev, subjects }))
  }
  
  const updateAvailability = (availability: BookingState['availability']) => {
    setState(prev => ({ ...prev, availability }))
  }
  
  const updateContact = (contact: BookingState['contact']) => {
    setState(prev => ({ ...prev, contact }))
  }

  // Reveal logic
  const revealNext = (currentSection: keyof typeof revealed) => {
    setRevealed(prev => {
      const next = { ...prev }
      if (currentSection === 'subjects') next.availability = true
      if (currentSection === 'availability') next.contact = true
      if (currentSection === 'contact') next.plan = true
      return next
    })
  }

  return {
    state,
    setState,
    revealed,
    setRevealed,
    memberStatus,
    setMemberStatus,
    updateSubjects,
    updateAvailability,
    updateContact,
    revealNext
  }
}
