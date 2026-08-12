import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOnlinePriceCents } from '@/lib/online-price'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .eq('is_active', true)
    .order('price_cents')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json((data ?? []).map((row) => ({
    ...row,
    online_price_cents: getOnlinePriceCents(row.price_cents, row.online_price_cents),
  })))
}
