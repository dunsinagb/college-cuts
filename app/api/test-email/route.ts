import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CollegeCuts Tracker <onboarding@resend.dev>',
      to: ['agbolaboridunsin@gmail.com'],
      subject: 'Test Email from CollegeCuts',
      text: 'This is a test email to verify Resend is working correctly.',
      html: '<p>This is a test email to verify Resend is working correctly.</p>',
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('Test email sent successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
} 