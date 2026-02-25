"use client"

import React, { useState } from 'react'
import { SidePanel, SidePanelSection, SidePanelFooterAction } from '@/components/layout/SidePanel'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

interface SendInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SendInviteModal({
  isOpen,
  onClose,
  onSuccess
}: SendInviteModalProps) {
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vendor-invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, notes })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)

    } catch (err: any) {
      setError(err.message || 'Failed to send invite')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setNotes('')
    setError('')
    setSuccess(false)
    onClose()
  }

  const fieldStyle = {
    width: '100%',
    padding: 'var(--stm-space-3)',
    fontSize: 'var(--stm-text-sm)',
    border: '1px solid var(--stm-border)',
    borderRadius: 'var(--stm-radius-md)',
    backgroundColor: 'var(--stm-background)',
    color: 'var(--stm-foreground)',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Vendor Invite"
      footer={
        <>
          <SidePanelFooterAction onClick={handleClose} label="Cancel" disabled={isSubmitting} />
          <SidePanelFooterAction
            onClick={handleSubmit}
            label={isSubmitting ? 'Sending...' : success ? 'Sent!' : 'Send Invite'}
            variant="primary"
            disabled={isSubmitting || success}
          />
        </>
      }
    >
      <SidePanelSection title="Invite Details">
        {/* Email */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--stm-text-sm)',
            fontWeight: 'var(--stm-font-medium)',
            color: 'var(--stm-foreground)',
            marginBottom: 'var(--stm-space-2)',
          }}>
            Email Address *
          </label>
          <input
            type="email"
            placeholder="vendor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={fieldStyle}
            disabled={isSubmitting || success}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--stm-text-sm)',
            fontWeight: 'var(--stm-font-medium)',
            color: 'var(--stm-foreground)',
            marginBottom: 'var(--stm-space-2)',
          }}>
            Notes (Optional)
          </label>
          <textarea
            placeholder="Add any notes about this vendor..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical' as const, minHeight: '80px' }}
            disabled={isSubmitting || success}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-3)',
            backgroundColor: 'color-mix(in srgb, var(--stm-error) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--stm-error) 30%, transparent)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: 'var(--stm-error)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-error)' }}>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--stm-space-2)',
            padding: 'var(--stm-space-3)',
            backgroundColor: 'color-mix(in srgb, var(--stm-success) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--stm-success) 30%, transparent)',
            borderRadius: 'var(--stm-radius-md)',
          }}>
            <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--stm-success)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-success)' }}>Invite sent successfully!</span>
          </div>
        )}
      </SidePanelSection>

      {/* Info Box */}
      <div style={{
        padding: 'var(--stm-space-4)',
        backgroundColor: 'color-mix(in srgb, var(--stm-primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
        borderRadius: 'var(--stm-radius-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-2)' }}>
          <Mail style={{ width: '14px', height: '14px', color: 'var(--stm-primary)' }} />
          <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)' }}>
            What happens next
          </span>
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)', paddingLeft: 'var(--stm-space-4)' }}>
          {['Vendor receives email with application link', 'Invite expires in 7 days', "You'll review their application before approval"].map((item) => (
            <li key={item} style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>{item}</li>
          ))}
        </ul>
      </div>
    </SidePanel>
  )
}
