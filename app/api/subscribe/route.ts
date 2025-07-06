import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabaseServer'

/// <reference types="node" />

export async function POST(req: Request) {
  try {
    const { email } = await req.json() as { email?: string }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const client = getServerSupabaseClient()
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { error } = await client
      .from('subscribers')
      .insert({ email })

    if (error && error.code !== '23505') { // ignore duplicate email error
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Success → set cookie
    const res = NextResponse.json({ ok: true })
    res.cookies.set('cc_sub', '1', { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return res
  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 