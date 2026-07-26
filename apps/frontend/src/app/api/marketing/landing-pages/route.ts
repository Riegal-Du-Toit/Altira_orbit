import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: pages, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(pages || [])
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    )
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const name = String(body.name || '').trim()
    const title = String(body.title || name).trim()
    const description = String(body.description || '').trim()
    const status = body.status === 'active' ? 'active' : 'draft'
    const slug = slugify(String(body.slug || name))
    const sections = Array.isArray(body.sections) ? body.sections : []

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    if (sections.length === 0) {
      return NextResponse.json(
        { error: 'Add at least one funnel section before saving' },
        { status: 400 }
      )
    }

    const payload = {
      name,
      slug,
      title,
      description,
      template: 'funnel-builder',
      status,
      content: {
        version: 1,
        sections,
      },
      metadata: {
        builder: 'altira-funnel-builder',
        section_count: sections.length,
      },
      updated_at: new Date().toISOString(),
    }

    const { data: existingPage, error: lookupError } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (lookupError) throw lookupError

    const query = existingPage
      ? supabase
          .from('landing_pages')
          .update(payload)
          .eq('id', existingPage.id)
      : supabase
          .from('landing_pages')
          .insert(payload)

    const { data, error } = await query
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error saving landing page:', error)
    return NextResponse.json(
      { error: 'Failed to save landing page' },
      { status: 500 }
    )
  }
}
