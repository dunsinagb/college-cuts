import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CollegeCuts <noreply@collegecuts.com>',
      to: ['test@example.com'],
      subject: 'Test Email from CollegeCuts',
      html: '<p>This is a test email from CollegeCuts application.</p>',
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