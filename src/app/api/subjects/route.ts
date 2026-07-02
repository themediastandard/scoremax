import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { buildSubjectCatalog } from '@/lib/subject-catalog'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  const grouped = buildSubjectCatalog(data ?? [])
  
  return NextResponse.json(grouped)
}
