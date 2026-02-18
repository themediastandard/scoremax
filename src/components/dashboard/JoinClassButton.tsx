"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'

interface JoinClassButtonProps {
  meetUrl: string
  sessionStart: string
  sessionEnd: string
}

export function JoinClassButton({ meetUrl, sessionStart, sessionEnd }: JoinClassButtonProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeLabel, setTimeLabel] = useState('')

  useEffect(() => {
    function checkTime() {
      const now = Date.now()
      const start = new Date(sessionStart).getTime()
      const end = new Date(sessionEnd).getTime()
      const earlyJoin = start - 10 * 60 * 1000 // 10 minutes early

      if (now >= end) {
        setIsActive(false)
        setTimeLabel('Session ended')
      } else if (now >= earlyJoin) {
        setIsActive(true)
        setTimeLabel('')
      } else {
        setIsActive(false)
        const diff = start - now
        const hours = Math.floor(diff / 3600000)
        const mins = Math.floor((diff % 3600000) / 60000)
        if (hours > 24) {
          const days = Math.floor(hours / 24)
          setTimeLabel(`in ${days}d`)
        } else if (hours > 0) {
          setTimeLabel(`in ${hours}h ${mins}m`)
        } else {
          setTimeLabel(`in ${mins}m`)
        }
      }
    }

    checkTime()
    const interval = setInterval(checkTime, 30000)
    return () => clearInterval(interval)
  }, [sessionStart, sessionEnd])

  if (isActive) {
    return (
      <a href={meetUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Video className="h-4 w-4" />
          Join Class
        </Button>
      </a>
    )
  }

  return (
    <Button size="sm" variant="outline" disabled className="gap-1.5 text-gray-400 border-gray-200">
      <Video className="h-4 w-4" />
      Join Class {timeLabel ? `(${timeLabel})` : ''}
    </Button>
  )
}
