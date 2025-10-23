// Email utility using Mailgun for transactional emails
// [C2] Sprint 5: Automated Review Workflow

import formData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
})

const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.singlethrow.com'
const FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL || 'ViRA <noreply@singlethrow.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vira.vercel.app'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  tags?: string[]
}

export async function sendEmail(options: EmailOptions) {
  try {
    const messageData = {
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      'o:tag': options.tags || [],
      'o:tracking': true,
      'o:tracking-clicks': false,
      'o:tracking-opens': false,
    }

    const response = await mg.messages.create(MAILGUN_DOMAIN, messageData)
    return {
      success: true,
      messageId: response.id,
      message: response.message,
    }
  } catch (error: any) {
    console.error('Mailgun send error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

// Helper to strip HTML tags for plain text fallback
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ===================================================
// EMAIL TEMPLATES
// ===================================================

export function generateReviewAssignmentEmail(data: {
  reviewerName: string
  projectTitle: string
  projectId: string
  dueDate: string
  assignedBy?: string
}) {
  const dueDateFormatted = new Date(data.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `New Review Assignment: ${data.projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #6B8F71; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">ViRA Project Review</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.reviewerName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            You have been assigned to review a new project:
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6B8F71; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #2C3E50;">
              ${data.projectTitle}
            </h2>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Due Date:</strong> ${dueDateFormatted}
            </p>
            ${data.assignedBy ? `
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Assigned By:</strong> ${data.assignedBy}
            </p>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/projects/${data.projectId}"
               style="display: inline-block; background-color: #6B8F71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Review Project
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Please complete your review by the due date. If you have any questions, contact your administrator.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from ViRA. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `,
  }
}

export function generateReviewReminderEmail(data: {
  reviewerName: string
  projectTitle: string
  projectId: string
  dueDate: string
  daysUntilDue: number
  reminderType: 'first_reminder' | 'second_reminder' | 'final_reminder'
}) {
  const dueDateFormatted = new Date(data.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const urgencyColor = data.daysUntilDue <= 2 ? '#e74c3c' : data.daysUntilDue <= 5 ? '#f39c12' : '#6B8F71'
  const urgencyText =
    data.daysUntilDue <= 0
      ? 'This review is overdue!'
      : data.daysUntilDue === 1
        ? 'This review is due tomorrow!'
        : `This review is due in ${data.daysUntilDue} days.`

  return {
    subject: `Reminder: Project Review Due ${data.daysUntilDue <= 2 ? 'Soon' : ''} - ${data.projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: ${urgencyColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⏰ Review Reminder</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.reviewerName},</p>

          <div style="background-color: ${urgencyColor}20; padding: 15px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: ${urgencyColor};">
              ${urgencyText}
            </p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            You have a pending project review that needs your attention:
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #2C3E50;">
              ${data.projectTitle}
            </h2>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Due Date:</strong> ${dueDateFormatted}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/projects/${data.projectId}"
               style="display: inline-block; background-color: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Complete Review Now
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Timely reviews help maintain project quality and client satisfaction. Thank you for your attention to this.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated reminder from ViRA. Please do not reply to this email.
          </p>
        </div>
      </body>
      </html>
    `,
  }
}

// [R10] Welcome email for new user accounts
// → needs: user-creation
// → provides: automated-onboarding
export function generateWelcomeEmail(data: {
  email: string
  fullName: string
  tempPassword: string
  role: string
}) {
  return {
    subject: 'Welcome to ViRA - Your Account Is Ready',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #6B8F71; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to ViRA</h1>
        </div>

        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.fullName},</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your account has been created in the <strong>ViRA Vendor Relationship Analytics</strong> platform.
          </p>

          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6B8F71; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #2C3E50;">
              Your Login Credentials
            </h2>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Email:</strong> ${data.email}
            </p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Temporary Password:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${data.tempPassword}</code>
            </p>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">
              <strong>Role:</strong> ${data.role.charAt(0).toUpperCase() + data.role.slice(1)}
            </p>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Important Security Notice:</p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
              <li>You'll be required to change your password on first login</li>
              <li>This temporary password expires after first use</li>
              <li>Choose a strong password (min 8 characters)</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/login"
               style="display: inline-block; background-color: #6B8F71; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Login to ViRA
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions or need assistance, please contact your administrator.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message from ViRA. For security reasons, please do not share your credentials.
          </p>
        </div>
      </body>
      </html>
    `,
  }
}
