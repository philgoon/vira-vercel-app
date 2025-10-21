"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { UserPlus, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react'

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

    // Validation
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

      // Don't auto-close - let admin copy password first
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
      console.error('Failed to copy password:', error)
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account for the ViRA platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={isSubmitting || success}
            />
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full"
              disabled={isSubmitting || success}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              User Role *
            </Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'team' | 'vendor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || success}
            >
              <option value="team">Team Member</option>
              <option value="admin">Administrator</option>
              <option value="vendor">Vendor</option>
            </select>
            <p className="text-xs text-gray-500">
              {role === 'admin' && '• Full access to all features and user management'}
              {role === 'team' && '• Can rate projects and view vendor ratings'}
              {role === 'vendor' && '• Can view their own ratings only'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message with Password */}
          {success && tempPassword && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">User created successfully!</p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  ⚠️ Temporary Password (copy and share with user):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded text-sm font-mono">
                    {tempPassword}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPassword}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  User will need to change this password on first login
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>📧 What happens next:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>User account created with temporary password</li>
                <li>Share password securely with the user</li>
                <li>User must change password on first login</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {success ? (
            <Button
              onClick={handleSuccessClose}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
