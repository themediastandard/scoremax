"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Loader2 } from 'lucide-react'

export function ReceiptButton({ bookingId, compact }: { bookingId: string; compact?: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const res = await fetch(`/api/account/receipt?booking_id=${bookingId}`)
      if (res.ok) {
        const { url } = await res.json()
        window.open(url, '_blank')
      }
    } catch {
      // Receipt not available
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className={compact
        ? "gap-1.5 text-[#517cad] border-[#517cad]/40 hover:bg-[#517cad]/5"
        : "w-full mt-3 gap-1.5 text-[#517cad]"
      }
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
      Receipt
    </Button>
  )
}
