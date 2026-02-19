'use client'

import { useState, useEffect, useRef } from 'react'
import { useViRAAuth } from '@/hooks/useViRAAuth'
import { Bell } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  notification_id: string
  notification_type: string
  title: string
  message: string
  link_url: string | null
  created_at: string
  is_read: boolean
  read_at: string | null
}

export default function NotificationBell() {
  const { profile } = useViRAAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profile?.user_id) {
      loadNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [profile?.user_id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const loadNotifications = async () => {
    if (!profile?.user_id) return
    
    // Skip notifications in development mode with skip-auth-user
    if (profile.user_id === 'skip-auth-user') return

    try {
      const response = await fetch(`/api/notifications?user_id=${profile.user_id}`)
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    if (!profile?.user_id) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          notification_ids: notificationIds
        })
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!profile?.user_id) return

    setLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.user_id,
          mark_all_read: true
        })
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead([notification.notification_id])
    }
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review_assigned':
        return '👤'
      case 'review_reminder':
        return '⏰'
      case 'review_completed':
        return '✅'
      case 'application_approved':
        return '🎉'
      case 'application_rejected':
        return '❌'
      default:
        return '📢'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!profile) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    {notification.link_url ? (
                      <Link
                        href={notification.link_url}
                        onClick={() => handleNotificationClick(notification)}
                        className="block"
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <div onClick={() => handleNotificationClick(notification)}>
                        <NotificationContent notification={notification} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationContent({ notification }: { notification: Notification }) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review_assigned':
        return '👤'
      case 'review_reminder':
        return '⏰'
      case 'review_completed':
        return '✅'
      case 'application_approved':
        return '🎉'
      case 'application_rejected':
        return '❌'
      default:
        return '📢'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.notification_type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
      )}
    </div>
  )
}
