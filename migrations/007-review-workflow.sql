-- Migration 007: Automated Review Workflow
-- [C2] Review assignment tracking, email reminders, and monitoring

-- =====================================================
-- REVIEW ASSIGNMENTS TABLE
-- =====================================================
-- Tracks who is assigned to review which projects

CREATE TABLE IF NOT EXISTS review_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  notes TEXT,
  UNIQUE(project_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_review_assignments_project ON review_assignments(project_id);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_review_assignments_status ON review_assignments(status);
CREATE INDEX idx_review_assignments_due_date ON review_assignments(due_date);

-- =====================================================
-- REVIEW REMINDERS TABLE
-- =====================================================
-- Tracks email reminders sent for review assignments

CREATE TABLE IF NOT EXISTS review_reminders (
  reminder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES review_assignments(assignment_id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('initial', 'first_reminder', 'second_reminder', 'final_reminder')),
  email_status TEXT DEFAULT 'sent' CHECK (email_status IN ('sent', 'delivered', 'failed', 'bounced')),
  email_id TEXT, -- Mailgun message ID
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_review_reminders_assignment ON review_reminders(assignment_id);
CREATE INDEX idx_review_reminders_sent_at ON review_reminders(sent_at);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
-- In-app notifications for users

CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('review_assigned', 'review_reminder', 'review_completed', 'application_approved', 'application_rejected', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB -- Additional context data
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Review Assignments Policies
-- Admins can manage all assignments
CREATE POLICY "Admins can manage review assignments"
  ON review_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Reviewers can view their own assignments
CREATE POLICY "Reviewers can view their assignments"
  ON review_assignments
  FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Reviewers can update their assignment status
CREATE POLICY "Reviewers can update their assignment status"
  ON review_assignments
  FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- Review Reminders Policies
-- Admins can view all reminders
CREATE POLICY "Admins can view review reminders"
  ON review_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- System can insert reminders (service role)
CREATE POLICY "Service role can insert reminders"
  ON review_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications Policies
-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins and system can create notifications
CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('admin')
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to auto-update assignment status based on due date
CREATE OR REPLACE FUNCTION update_overdue_assignments()
RETURNS void AS $$
BEGIN
  UPDATE review_assignments
  SET status = 'overdue'
  WHERE status IN ('pending', 'in_progress')
    AND due_date < NOW()
    AND completed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to mark assignment as completed when project is rated
CREATE OR REPLACE FUNCTION mark_assignment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.overall_rating IS NOT NULL AND OLD.overall_rating IS NULL THEN
    UPDATE review_assignments
    SET status = 'completed',
        completed_at = NOW()
    WHERE project_id = NEW.project_id
      AND status != 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-complete assignments when project is rated
CREATE TRIGGER trigger_mark_assignment_completed
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION mark_assignment_completed();

-- Function to get unread notification count for user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE;
$$ LANGUAGE sql STABLE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE review_assignments IS 'Tracks project review assignments to team members';
COMMENT ON TABLE review_reminders IS 'Tracks email reminders sent for pending reviews';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON FUNCTION update_overdue_assignments() IS 'Updates assignment status to overdue for past due dates';
COMMENT ON FUNCTION mark_assignment_completed() IS 'Auto-completes review assignments when project is rated';
COMMENT ON FUNCTION get_unread_notification_count(UUID) IS 'Returns count of unread notifications for a user';
