'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PricingRow {
  id: string
  name: string
  type: string
  tier: string | null
  price_cents: number
  stripe_price_id: string | null
  included_hours: number | null
  is_active: boolean
}

interface PricingFormProps {
  item: PricingRow
  children: React.ReactNode
}

export function PricingForm({ item, children }: PricingFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [priceDollars, setPriceDollars] = useState((item.price_cents / 100).toFixed(2))
  const [name, setName] = useState(item.name)
  const [includedHours, setIncludedHours] = useState(item.included_hours?.toString() ?? '')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const price_cents = Math.round(parseFloat(priceDollars) * 100)
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: name.trim(),
          price_cents,
          included_hours: includedHours ? parseInt(includedHours, 10) : null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update')
      }
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={priceDollars}
              onChange={(e) => setPriceDollars(e.target.value)}
              className="mt-1"
            />
          </div>
          {(item.type === 'membership' || item.type === 'package' || item.type === 'course' || item.type === 'sat-course-inperson') && (
            <div>
              <Label htmlFor="hours">Included Hours</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                value={includedHours}
                onChange={(e) => setIncludedHours(e.target.value)}
                placeholder="Leave empty if not applicable"
                className="mt-1"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
