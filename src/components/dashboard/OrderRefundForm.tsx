"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle } from 'lucide-react'

export function OrderRefundForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const handleRefund = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'refunded' }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to process refund')
      } else {
        setConfirming(false)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      alert('Error processing refund')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-red-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Refund Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!confirming ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Process a refund for this order. This will cancel all linked sessions.
            </p>
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setConfirming(true)}
            >
              Initiate Refund
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-medium">
              Are you sure? This will issue a Stripe refund and cancel all sessions for this order.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleRefund}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Refund'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
