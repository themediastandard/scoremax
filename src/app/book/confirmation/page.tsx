"use client"

import { ConfirmationView } from '@/components/booking/ConfirmationView'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  
  useEffect(() => {
    if (sessionId) {
      // TODO: Fetch booking details by session_id
      // For now just show success
    }
  }, [sessionId])

  return (
    <ConfirmationView 
      bookingDetails={bookingDetails} 
      onBookAnother={() => router.push('/book')} 
    />
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="flex justify-center py-20">Loading...</div>}>
        <ConfirmationContent />
      </Suspense>
    </div>
  )
}