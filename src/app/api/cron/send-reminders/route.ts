import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateReviewReminderEmail } from '@/lib/mailgun'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Vercel Cron job endpoint - runs weekly
// Secured by Vercel Cron secret
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔔 Starting weekly review reminder job...')

    const now = new Date()
    const remindersSent = {
      initial: 0,
      first_reminder: 0,
      second_reminder: 0,
      final_reminder: 0,
      errors: 0,
    }

    // Get all pending and in-progress review assignments
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('review_assignments')
      .select(`
        assignment_id,
        project_id,
        reviewer_id,
        assigned_at,
        due_date,
        status,
        projects!review_assignments_project_id_fkey(project_title),
        user_profiles!review_assignments_reviewer_id_fkey(full_name, email)
      `)
      .in('status', ['pending', 'in_progress'])
      .not('due_date', 'is', null)

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError)
      return NextResponse.json({ error: assignmentsError.message }, { status: 500 })
    }

    if (!assignments || assignments.length === 0) {
      console.log('No pending assignments found')
      return NextResponse.json({
        success: true,
        message: 'No pending assignments to remind',
        reminders_sent: remindersSent,
      })
    }

    console.log(`Found ${assignments.length} pending assignments`)

    // Process each assignment
    for (const assignment of assignments) {
      try {
        const dueDate = new Date(assignment.due_date)
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Determine reminder type based on days until due
        let reminderType: 'initial' | 'first_reminder' | 'second_reminder' | 'final_reminder' | null = null

        if (daysUntilDue <= 0) {
          reminderType = 'final_reminder' // Overdue
        } else if (daysUntilDue <= 1) {
          reminderType = 'final_reminder' // Due tomorrow or today
        } else if (daysUntilDue <= 3) {
          reminderType = 'second_reminder' // 2-3 days
        } else if (daysUntilDue <= 5) {
          reminderType = 'first_reminder' // 4-5 days
        } else if (daysUntilDue <= 7) {
          // Check if initial reminder was already sent
          const { data: existingReminders } = await supabaseAdmin
            .from('review_reminders')
            .select('reminder_type')
            .eq('assignment_id', assignment.assignment_id)

          if (!existingReminders || existingReminders.length === 0) {
            reminderType = 'initial' // First reminder
          }
        }

        // Skip if no reminder needed
        if (!reminderType) {
          continue
        }

        // Check if this reminder type was already sent
        const { data: existingReminder } = await supabaseAdmin
          .from('review_reminders')
          .select('reminder_id')
          .eq('assignment_id', assignment.assignment_id)
          .eq('reminder_type', reminderType)
          .single()

        if (existingReminder) {
          console.log(`Reminder type ${reminderType} already sent for assignment ${assignment.assignment_id}`)
          continue
        }

        // Get reviewer info
        const reviewer = assignment.user_profiles as any
        const project = assignment.projects as any

        if (!reviewer?.email || !project?.project_title) {
          console.error('Missing reviewer email or project title for assignment', assignment.assignment_id)
          remindersSent.errors++
          continue
        }

        // Generate email content
        const emailContent = generateReviewReminderEmail({
          reviewerName: reviewer.full_name || reviewer.email,
          projectTitle: project.project_title,
          projectId: assignment.project_id,
          dueDate: assignment.due_date,
          daysUntilDue,
          reminderType: reminderType as any,
        })

        // Send email
        const emailResult = await sendEmail({
          to: reviewer.email,
          subject: emailContent.subject,
          html: emailContent.html,
          tags: ['review-reminder', reminderType, `assignment-${assignment.assignment_id}`],
        })

        if (emailResult.success) {
          // Record reminder in database
          await supabaseAdmin.from('review_reminders').insert({
            assignment_id: assignment.assignment_id,
            reminder_type: reminderType,
            email_status: 'sent',
            email_id: emailResult.messageId,
          })

          // Create in-app notification
          await supabaseAdmin.from('notifications').insert({
            user_id: assignment.reviewer_id,
            notification_type: 'review_reminder',
            title: 'Review Reminder',
            message: `Reminder: Your review for "${project.project_title}" is due ${daysUntilDue <= 0 ? 'now' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`,
            link_url: `/projects/${assignment.project_id}`,
          })

          remindersSent[reminderType]++
          console.log(`✅ Sent ${reminderType} reminder for assignment ${assignment.assignment_id}`)
        } else {
          console.error(`❌ Failed to send email for assignment ${assignment.assignment_id}:`, emailResult.error)
          remindersSent.errors++
        }
      } catch (error) {
        console.error(`Error processing assignment ${assignment.assignment_id}:`, error)
        remindersSent.errors++
      }
    }

    console.log('🎉 Weekly reminder job complete:', remindersSent)

    return NextResponse.json({
      success: true,
      message: 'Reminders sent successfully',
      reminders_sent: remindersSent,
      total_assignments: assignments.length,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
