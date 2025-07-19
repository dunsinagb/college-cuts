import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabaseServer'
import { resend } from '@/lib/resend'

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

    // Send welcome email (only if not duplicate)
    if (!error) {
      try {
        await resend.emails.send({
          from: 'CollegeCuts Tracker <onboarding@resend.dev>',
          to: [email],
          subject: 'Welcome to CollegeCuts Tracker!',
          html: `
            <h2>Welcome to CollegeCuts Tracker 🎓</h2>
            <p>Thank you for subscribing! You now have full access to the most comprehensive database of college program cuts, closures, and institutional changes in the U.S.</p>
            <ul>
              <li>🔎 Explore all program cuts and closures</li>
              <li>📊 Access analytics and trends</li>
              <li>💡 Get real-time updates</li>
            </ul>
            <p>We’re glad to have you on board.<br/>— The CollegeCuts Team</p>
          `
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
        // Don't fail the request if email fails, just log it
      }
    }

    // Success → set cookie
    const res = NextResponse.json({ ok: true })
    
    // Set cookie with more explicit options
    res.cookies.set('cc_sub', '1', { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: undefined // Let browser set the domain
    })
    
    console.log('🍪 Cookie set: cc_sub=1')
    
    // Also set a response header to help with debugging
    res.headers.set('X-Subscription-Status', 'active')
    
    return res
  } catch (error) {
    console.error('Subscribe API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 