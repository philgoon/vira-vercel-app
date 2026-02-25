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

export default function NotificationBell({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { profile } = useViRAAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (profile?.user_id) {
      loadNotifications()
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [profile?.user_id])

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
        body: JSON.stringify({ user_id: profile.user_id, notification_ids: notificationIds })
      })
      if (response.ok) await loadNotifications()
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
        body: JSON.stringify({ user_id: profile.user_id, mark_all_read: true })
      })
      if (response.ok) await loadNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) await markAsRead([notification.notification_id])
    setIsOpen(false)
  }

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      review_assigned: '👤',
      review_reminder: '⏰',
      review_completed: '✅',
      application_approved: '🎉',
      application_rejected: '❌',
    }
    return icons[type] || '📢'
  }

  const formatTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(dateString).toLocaleDateString()
  }

  if (!profile) return null

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        title="Notifications"
        style={{
          position: 'relative',
          width: variant === 'light' ? '34px' : undefined,
          height: variant === 'light' ? '34px' : undefined,
          padding: variant === 'light' ? '0' : 'var(--stm-space-2)',
          background: variant === 'light' ? 'var(--stm-background)' : 'none',
          border: variant === 'light' ? '1px solid var(--stm-border)' : 'none',
          borderRadius: variant === 'light' ? 'var(--stm-radius-md)' : 'var(--stm-radius-full)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.14s',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          if (variant === 'light') {
            el.style.backgroundColor = 'var(--stm-muted)';
            el.style.color = 'var(--stm-foreground)';
            el.style.borderColor = 'var(--stm-primary)';
          } else {
            el.style.backgroundColor = 'rgba(255,255,255,0.08)';
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          if (variant === 'light') {
            el.style.backgroundColor = 'var(--stm-background)';
            el.style.color = '';
            el.style.borderColor = 'var(--stm-border)';
          } else {
            el.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Bell style={{ width: variant === 'light' ? '15px' : '20px', height: variant === 'light' ? '15px' : '20px', color: variant === 'light' ? 'var(--stm-muted-foreground)' : 'rgba(255,255,255,0.75)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'var(--stm-error)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'var(--stm-font-bold)',
            borderRadius: 'var(--stm-radius-full)',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          ...(variant === 'light' ? { right: 0 } : { left: 0 }),
          marginTop: 'var(--stm-space-2)',
          width: '360px',
          backgroundColor: 'var(--stm-card)',
          borderRadius: 'var(--stm-radius-md)',
          boxShadow: 'var(--stm-shadow-xl)',
          border: '1px solid var(--stm-border)',
          zIndex: 50,
          maxHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: 'var(--stm-space-3) var(--stm-space-4)',
            borderBottom: '1px solid var(--stm-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', margin: 0 }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                style={{
                  fontSize: 'var(--stm-text-xs)',
                  fontWeight: 'var(--stm-font-medium)',
                  color: 'var(--stm-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 'var(--stm-space-8)', textAlign: 'center', color: 'var(--stm-muted-foreground)' }}>
                <Bell style={{ width: '40px', height: '40px', margin: '0 auto var(--stm-space-2)', color: 'var(--stm-border)' }} />
                <p style={{ fontSize: 'var(--stm-text-sm)', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notification_id}
                  style={{
                    borderBottom: '1px solid var(--stm-border)',
                    backgroundColor: !n.is_read ? 'color-mix(in srgb, var(--stm-primary) 5%, transparent)' : 'transparent',
                    transition: 'background-color var(--stm-duration-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--stm-muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = !n.is_read ? 'color-mix(in srgb, var(--stm-primary) 5%, transparent)' : 'transparent')}
                >
                  {n.link_url ? (
                    <Link href={n.link_url} onClick={() => handleNotificationClick(n)} style={{ display: 'block', padding: 'var(--stm-space-3) var(--stm-space-4)', textDecoration: 'none' }}>
                      <NotificationContent notification={n} getIcon={getIcon} formatTime={formatTime} />
                    </Link>
                  ) : (
                    <div onClick={() => handleNotificationClick(n)} style={{ padding: 'var(--stm-space-3) var(--stm-space-4)', cursor: 'pointer' }}>
                      <NotificationContent notification={n} getIcon={getIcon} formatTime={formatTime} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationContent({
  notification,
  getIcon,
  formatTime,
}: {
  notification: Notification
  getIcon: (type: string) => string
  formatTime: (date: string) => string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-3)' }}>
      <span style={{ fontSize: 'var(--stm-text-xl)', flexShrink: 0 }}>
        {getIcon(notification.notification_type)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'var(--stm-text-sm)', fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)', margin: 0 }}>
          {notification.title}
        </p>
        <p style={{
          fontSize: 'var(--stm-text-sm)',
          color: 'var(--stm-muted-foreground)',
          margin: 'var(--stm-space-1) 0 0',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        }}>
          {notification.message}
        </p>
        <p style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', margin: 'var(--stm-space-1) 0 0' }}>
          {formatTime(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--stm-primary)',
          borderRadius: 'var(--stm-radius-full)',
          flexShrink: 0,
          marginTop: 'var(--stm-space-2)',
        }} />
      )}
    </div>
  )
}
