import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { institution, cutDetails, sourceInfo, relationship, email, name } = body

    // Validate required fields
    if (!institution || !cutDetails || !sourceInfo || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create email content
    const emailContent = `
New Program Cut Tip Submission

Institution: ${institution}
Cut Details: ${cutDetails}
Source Information: ${sourceInfo}
Relationship to Organization: ${relationship}
${email ? `Contact Email: ${email}` : ''}
${name ? `Contact Name: ${name}` : ''}

Submitted at: ${new Date().toISOString()}
    `.trim()

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'CollegeCuts Tracker <onboarding@resend.dev>',
        to: ['agbolaboridunsin@gmail.com'],
        subject: 'New Program Cut Tip Submission',
        text: emailContent,
        html: emailContent.replace(/\n/g, '<br>'),
      })

      console.log('Email sent successfully to agbolaboridunsin@gmail.com')
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Tip submitted successfully. We will review and contact you if needed.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing tip submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 