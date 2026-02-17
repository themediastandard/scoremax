"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Clock, MapPin, Video } from 'lucide-react'

interface ConfirmationViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bookingDetails?: any
  onBookAnother: () => void
}

export function ConfirmationView({ bookingDetails, onBookAnother }: ConfirmationViewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-serif text-[#1e293b]">Request Received!</h1>
        <p className="text-gray-600 text-lg">
          We&apos;ve received your booking request. A ScoreMax team member will assign your tutor and confirm your exact session time within 24 hours.
        </p>
      </div>
      
      <Card className="border-t-4 border-t-[#c79d3c]">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">Requested Days</p>
                <p className="text-sm text-gray-500">{bookingDetails?.availability?.days?.join(', ') || 'Flexible'}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">Time Preference</p>
                <p className="text-sm text-gray-500">
                  {bookingDetails?.availability?.startTime} - {bookingDetails?.availability?.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              {bookingDetails?.sessionType === 'in-person' ? (
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              ) : (
                <Video className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-gray-500">
                  {bookingDetails?.sessionType === 'in-person' ? 'Sawgrass, FL Location' : 'Online (Zoom)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
               <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                 {bookingDetails?.subjects?.length}
               </div>
               <div>
                 <p className="font-medium">Subjects</p>
                 <p className="text-sm text-gray-500">
                   {/* We might not have subject names here easily if only IDs stored. */}
                   {bookingDetails?.subjects?.length} subjects selected
                 </p>
               </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">Check your email for confirmation details.</p>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Button onClick={onBookAnother} variant="outline" size="lg">
          Book Another Session
        </Button>
      </div>
    </div>
  )
}