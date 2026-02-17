import { useState } from 'react'

export interface BookingState {
  subjects: string[]
  sessionType: 'online' | 'in-person'
  availability: {
    days: string[]
    startTime: string
    endTime: string
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
      days: [],
      startTime: '',
      endTime: '',
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
    sessionType: false,
    availability: false,
    contact: false,
    plan: false
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memberStatus, setMemberStatus] = useState<any>(null)
  
  const updateSubjects = (subjects: string[]) => {
    setState(prev => ({ ...prev, subjects }))
  }
  
  const updateSessionType = (sessionType: 'online' | 'in-person') => {
    setState(prev => ({ ...prev, sessionType }))
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
      if (currentSection === 'subjects') {
        // Check if SAT is selected to reveal sessionType
        // Need to pass SAT ID or slug logic here
        // For now, assume caller handles 'sessionType' visibility check
        next.availability = true // Default next
      }
      if (currentSection === 'sessionType') next.availability = true
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
    updateSessionType,
    updateAvailability,
    updateContact,
    revealNext
  }
}