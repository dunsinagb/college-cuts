import { NextRequest, NextResponse } from 'next/server'

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

    // For now, we'll log the email content since we don't have email service configured
    // In production, you would integrate with a service like SendGrid, Resend, or similar
    console.log('Email would be sent to agbolaboridunsin@gmail.com:')
    console.log(emailContent)

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // Example with a hypothetical email service:
    // await emailService.send({
    //   to: 'agbolaboridunsin@gmail.com',
    //   subject: 'New Program Cut Tip Submission',
    //   text: emailContent,
    //   html: emailContent.replace(/\n/g, '<br>')
    // })

    // Store in database if needed
    // await supabase.from('tip_submissions').insert({
    //   institution,
    //   cut_details: cutDetails,
    //   source_info: sourceInfo,
    //   relationship,
    //   contact_email: email,
    //   contact_name: name,
    //   status: 'pending'
    // })

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