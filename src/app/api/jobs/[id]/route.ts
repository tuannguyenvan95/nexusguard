import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/utils'

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase.from('nexus_jobs').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete job:', err)
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })

    const body = await request.json()
    
    // Only update allowed fields
    const updates = {
      title: body.title,
      amount: body.amount,
      description: body.description,
      requirements: body.requirements, // Expecting an array of strings
      payouttype: body.payoutType,
      maxwinners: body.maxWinners,
      agent: body.agent
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('nexus_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, job: data })
  } catch (err) {
    console.error('Failed to update job:', err)
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 })
  }
}
