import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

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
  
  // Group by category for easier frontend consumption
  const grouped = data.reduce((acc, subject) => {
    const category = subject.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(subject)
    return acc
  }, {} as Record<string, typeof data>)

  // Inject In-Person SAT and In-Person ACT as synthetic options (distinct from remote SAT/ACT)
  const inPersonOptions = [
    { id: 'in-person-sat', name: 'In-Person SAT', slug: 'in-person-sat', category: 'test-prep' },
    { id: 'in-person-act', name: 'In-Person ACT', slug: 'in-person-act', category: 'test-prep' }
  ]
  if (grouped['test-prep']) {
    grouped['test-prep'] = [...inPersonOptions, ...grouped['test-prep']]
  } else {
    grouped['test-prep'] = inPersonOptions
  }
  
  return NextResponse.json(grouped)
}