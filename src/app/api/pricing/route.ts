import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .eq('is_active', true)
    .order('price_cents')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}