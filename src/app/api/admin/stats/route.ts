import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { count: pendingCount } = await supabaseAdmin
    .from('booking_requests')
    .select('id', { count: 'exact' })
    .eq('status', 'processing')

  const { count: activeCount } = await supabaseAdmin
    .from('booking_requests')
    .select('id', { count: 'exact' })
    .eq('status', 'active')

  const { count: memberCount } = await supabaseAdmin
    .from('memberships')
    .select('id', { count: 'exact' })
    .eq('status', 'active')
    
  // Revenue (this month)
  // This is a bit heavier, MVP might just show total revenue or last 30 days
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  const { data: revenueData } = await supabaseAdmin
    .from('payments')
    .select('amount_cents')
    .eq('status', 'succeeded')
    .gte('created_at', firstDay)
    
  const revenueCents = revenueData?.reduce((acc, curr) => acc + curr.amount_cents, 0) || 0

  return NextResponse.json({
    pendingBookings: pendingCount || 0,
    activeSessions: activeCount || 0,
    activeMembers: memberCount || 0,
    monthlyRevenue: revenueCents
  })
}