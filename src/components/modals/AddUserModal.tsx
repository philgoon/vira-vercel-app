"use client"

import React, { useState } from 'react'
import { SidePanel, SidePanelSection, SidePanelFooterAction } from '@/components/layout/SidePanel'
import { UserPlus, CheckCircle, AlertCircle, Copy } from 'lucide-react'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess
}: AddUserModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'team' | 'vendor'>('team')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tempPassword, setTempPassword] = useState('')

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)
    setTempPassword('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    if (!fullName || !fullName.trim()) {
      setError('Please enter a full name')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim(),
          role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setSuccess(true)
      setTempPassword(data.tempPassword)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword)
      alert('Temporary password copied to clipboard!')
    } catch (error) {
      alert('Failed to copy password. Password: ' + tempPassword)
    }
  }

  const handleClose = () => {
    setEmail('')
    setFullName('')
    setRole('team')
    setError('')
    setSuccess(false)
    setTempPassword('')
    onClose()
  }

  const handleSuccessClose = () => {
    onSuccess()
    handleClose()
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

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--stm-text-sm)',
    fontWeight: 'var(--stm-font-medium)',
    color: 'var(--stm-foreground)',
    marginBottom: 'var(--stm-space-2)',
  }

  const roleDescriptions = {
    admin: 'Full access to all features and user management',
    team: 'Can rate projects and view vendor ratings',
    vendor: 'Can view their own ratings only',
  }

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New User"
      footer={
        success ? (
          <SidePanelFooterAction onClick={handleSuccessClose} label="Done" variant="primary" />
        ) : (
          <>
            <SidePanelFooterAction onClick={handleClose} label="Cancel" disabled={isSubmitting} />
            <SidePanelFooterAction
              onClick={handleSubmit}
              label={isSubmitting ? 'Creating...' : 'Create User'}
              variant="primary"
              disabled={isSubmitting}
            />
          </>
        )
      }
    >
      {!success && (
        <SidePanelSection title="User Details">
          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldStyle}
              disabled={isSubmitting}
            />
          </div>

          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={fieldStyle}
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div>
            <label style={labelStyle}>User Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'team' | 'vendor')}
              style={fieldStyle}
              disabled={isSubmitting}
            >
              <option value="team">Team Member</option>
              <option value="admin">Administrator</option>
              <option value="vendor">Vendor</option>
            </select>
            <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-1)' }}>
              {roleDescriptions[role]}
            </p>
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
        </SidePanelSection>
      )}

      {/* Success State */}
      {success && (
        <SidePanelSection title="User Created">
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
            <span style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-success)' }}>User created successfully!</span>
          </div>

          {tempPassword && (
            <div style={{
              padding: 'var(--stm-space-4)',
              backgroundColor: 'color-mix(in srgb, var(--stm-warning) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--stm-warning) 30%, transparent)',
              borderRadius: 'var(--stm-radius-md)',
            }}>
              <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', marginBottom: 'var(--stm-space-2)' }}>
                Temporary Password — copy and share with user:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)' }}>
                <code style={{
                  flex: 1,
                  padding: 'var(--stm-space-2) var(--stm-space-3)',
                  backgroundColor: 'var(--stm-card)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-sm)',
                  fontSize: 'var(--stm-text-sm)',
                  fontFamily: 'monospace',
                  color: 'var(--stm-foreground)',
                }}>
                  {tempPassword}
                </code>
                <button
                  onClick={handleCopyPassword}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--stm-space-1)',
                    padding: 'var(--stm-space-2) var(--stm-space-3)',
                    fontSize: 'var(--stm-text-sm)',
                    border: '1px solid var(--stm-border)',
                    borderRadius: 'var(--stm-radius-md)',
                    backgroundColor: 'var(--stm-card)',
                    color: 'var(--stm-foreground)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Copy style={{ width: '14px', height: '14px' }} />
                  Copy
                </button>
              </div>
              <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', marginTop: 'var(--stm-space-2)' }}>
                User will need to change this password on first login
              </p>
            </div>
          )}
        </SidePanelSection>
      )}

      {/* Info Box */}
      {!success && (
        <div style={{
          padding: 'var(--stm-space-4)',
          backgroundColor: 'color-mix(in srgb, var(--stm-primary) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-primary) 20%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-2)' }}>
            <UserPlus style={{ width: '14px', height: '14px', color: 'var(--stm-primary)' }} />
            <span style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-primary)' }}>
              What happens next
            </span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stm-space-1)', paddingLeft: 'var(--stm-space-4)' }}>
            {['User account created with temporary password', 'Share password securely with the user', 'User must change password on first login'].map((item) => (
              <li key={item} style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-muted-foreground)' }}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </SidePanel>
  )
}
