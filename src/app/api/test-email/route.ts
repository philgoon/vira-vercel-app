// [R-TEST] Mailgun test endpoint for local debugging
// → needs: mailgun-config
// → provides: email-diagnostics
import { NextResponse } from 'next/server'
import { sendEmail, generateWelcomeEmail } from '@/lib/mailgun'

export async function GET() {
  try {
    // Check environment variables
    const config = {
      apiKey: process.env.MAILGUN_API_KEY ? '✅ Set' : '❌ Missing',
      domain: process.env.MAILGUN_DOMAIN || 'mg.singlethrow.com (default)',
      fromEmail: process.env.MAILGUN_FROM_EMAIL || 'ViRA <noreply@singlethrow.com> (default)',
    }

    console.log('Mailgun Configuration:', config)

    // Try sending a test email
    const testEmail = generateWelcomeEmail({
      email: 'test@example.com',
      fullName: 'Test User',
      tempPassword: 'TestPassword123!',
      role: 'team'
    })

    const result = await sendEmail({
      to: process.env.MAILGUN_FROM_EMAIL || 'vira@singlethrow.com', // Send to ourselves
      subject: '[TEST] Mailgun Connection Test',
      html: testEmail.html,
      tags: ['test-email']
    })

    return NextResponse.json({
      config,
      emailResult: result,
      message: result.success
        ? '✅ Email sent successfully! Check your inbox.'
        : '❌ Email failed to send. Check error details.'
    })

  } catch (error: unknown) {
    const err = error as Error
    console.error('Test email error:', err)
    return NextResponse.json({
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
