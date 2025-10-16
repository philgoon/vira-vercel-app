'use client';

import { useState } from 'react';
import { 
  Star, TrendingUp, Users, CheckCircle, AlertCircle, XCircle, 
  Briefcase, Plus, Upload, Search, Filter, X, Check,
  Clock, Calendar, Mail, Phone, MapPin, Building2
} from 'lucide-react';

const themes = {
  professional: {
    name: 'Professional Blue',
    description: 'Trust & Reliability',
    colors: {
      primary: '#1A5276',
      secondary: '#6B8F71',
      accent: '#0080FF',
      background: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E5E7EB',
      text: '#111827',
      textMuted: '#6B7280',
      success: '#059669',
      warning: '#F59E0B',
      error: '#DC2626',
    }
  },
  modern: {
    name: 'Modern Slate',
    description: 'Tech & Innovation',
    colors: {
      primary: '#478BF9',
      secondary: '#4EBAAA',
      accent: '#9B59D0',
      background: '#0A0A0F',
      card: '#18181B',
      border: '#27272A',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    }
  },
  warm: {
    name: 'Warm Professional',
    description: 'Approachable & Human',
    colors: {
      primary: '#1A4B87',
      secondary: '#E97847',
      accent: '#56B897',
      background: '#FAF8F5',
      card: '#FFFFFF',
      border: '#E5E2DC',
      text: '#2C1810',
      textMuted: '#78716C',
      success: '#059669',
      warning: '#F59E0B',
      error: '#DC2626',
    }
  }
};

type ThemeKey = keyof typeof themes;

function ThemePreview({ themeKey }: { themeKey: ThemeKey }) {
  const theme = themes[themeKey];
  const isDark = themeKey === 'modern';

  return (
    <div 
      className="flex-1 min-w-[400px] rounded-lg overflow-hidden"
      style={{ 
        backgroundColor: theme.colors.background,
        border: `2px solid ${theme.colors.border}`
      }}
    >
      {/* Header */}
      <div 
        className="p-6 border-b"
        style={{ 
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card
        }}
      >
        <h2 
          className="text-2xl font-bold mb-1"
          style={{ color: theme.colors.text }}
        >
          {theme.name}
        </h2>
        <p style={{ color: theme.colors.textMuted }}>
          {theme.description}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Buttons */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            BUTTONS
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: '#FFFFFF'
              }}
            >
              Primary
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: '#FFFFFF'
              }}
            >
              Secondary
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`
              }}
            >
              Outline
            </button>
          </div>
        </div>

        {/* Cards */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            CARDS
          </h3>
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="p-2 rounded"
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              >
                <TrendingUp 
                  className="w-5 h-5"
                  style={{ color: theme.colors.primary }}
                />
              </div>
              <div className="flex-1">
                <h4 
                  className="font-semibold mb-1"
                  style={{ color: theme.colors.text }}
                >
                  Card Title
                </h4>
                <p 
                  className="text-sm"
                  style={{ color: theme.colors.textMuted }}
                >
                  This is a sample card showing how content looks in this theme.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            BADGES & STATUS
          </h3>
          <div className="flex flex-wrap gap-2">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              style={{ 
                backgroundColor: `${theme.colors.success}20`,
                color: theme.colors.success
              }}
            >
              <CheckCircle className="w-4 h-4" />
              Success
            </span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              style={{ 
                backgroundColor: `${theme.colors.warning}20`,
                color: theme.colors.warning
              }}
            >
              <AlertCircle className="w-4 h-4" />
              Warning
            </span>
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
              style={{ 
                backgroundColor: `${theme.colors.error}20`,
                color: theme.colors.error
              }}
            >
              <XCircle className="w-4 h-4" />
              Error
            </span>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            STATS DISPLAY
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users 
                  className="w-4 h-4"
                  style={{ color: theme.colors.primary }}
                />
                <span 
                  className="text-sm"
                  style={{ color: theme.colors.textMuted }}
                >
                  Vendors
                </span>
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: theme.colors.text }}
              >
                42
              </div>
            </div>
            <div 
              className="p-4 rounded-lg"
              style={{ 
                backgroundColor: theme.colors.card,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star 
                  className="w-4 h-4"
                  style={{ color: theme.colors.secondary }}
                />
                <span 
                  className="text-sm"
                  style={{ color: theme.colors.textMuted }}
                >
                  Avg Rating
                </span>
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: theme.colors.text }}
              >
                8.4
              </div>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            FORM INPUTS
          </h3>
          <input
            type="text"
            placeholder="Enter text..."
            className="w-full px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.text
            }}
          />
        </div>

        {/* Color Palette */}
        <div>
          <h3 
            className="text-sm font-semibold mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            COLOR PALETTE
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div 
                className="w-full h-12 rounded mb-1"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <span 
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Primary
              </span>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-12 rounded mb-1"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <span 
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Secondary
              </span>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-12 rounded mb-1"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <span 
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Accent
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ThemePreviewPage() {
  const [activeModal, setActiveModal] = useState(false);
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* ============================================
          PAGE HEADER - Example of PageHeader component
          ============================================ */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-headline)',
            fontWeight: 'bold',
            color: '#1A5276',
            marginBottom: '0.5rem'
          }}>
            ViRA Design System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Complete component library • Professional Blue Theme (#1A5276)
          </p>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ========== SECTION 1: COLOR PALETTE ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            1. Color Palette
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Primary Color - Blue (SINGLE) */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#1A5276', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Primary - Blue (SINGLE)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #1A5276
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Buttons, sidebar, links, wizards
              </div>
            </div>

            {/* Secondary Color - Green (THROW) */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#6B8F71', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Secondary - Green (THROW)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #6B8F71
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Success states, completion
              </div>
            </div>

            {/* Neutral Color - Gray (MARKETING) */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#6E6F71', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Neutral - Gray (MARKETING)
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #6E6F71
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Secondary text, disabled states
              </div>
            </div>

            {/* Success Color */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#059669', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Success
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #059669
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                hsl(var(--success))
              </div>
            </div>

            {/* Warning Color */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#F59E0B', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Warning
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #F59E0B
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                hsl(var(--warning))
              </div>
            </div>

            {/* Error Color */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#DC2626', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Error / Destructive
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #DC2626
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                hsl(var(--destructive))
              </div>
            </div>

            {/* Muted Colors */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#6b7280', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Muted Text
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #6b7280
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                hsl(var(--muted-foreground))
              </div>
            </div>

            {/* Border Color */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                backgroundColor: '#e5e7eb', 
                height: '80px', 
                borderRadius: '0.375rem',
                marginBottom: '0.75rem',
                border: '1px solid #d1d5db'
              }} />
              <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                Border
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>
                #e5e7eb
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                hsl(var(--border))
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 2: TYPOGRAPHY ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            2. Typography
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ 
                fontSize: '2.25rem', 
                fontWeight: 'bold', 
                color: '#1A5276',
                fontFamily: 'var(--font-headline)',
                marginBottom: '0.5rem'
              }}>
                Heading 1 (2.25rem) - Headline Font
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Used for page titles • font-family: var(--font-headline) • color: #1A5276
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.875rem', 
                fontWeight: 'bold', 
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Heading 2 (1.875rem) - Section Headers
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Used for main sections • font-weight: bold • color: #111827
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Heading 3 (1.5rem) - Subsections
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Used for subsections • font-weight: 600 • color: #111827
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Heading 4 (1.125rem) - Card Titles
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Used for card titles (.list-card-title) • font-weight: 600 • color: #111827
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1rem', color: '#111827', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                Body Text (1rem) - This is standard body text used throughout the application. It maintains good readability with proper line height and comfortable color contrast.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                font-size: 1rem • color: #111827 • line-height: 1.6
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                Small Text (0.875rem) - Used for secondary information, metadata, and helper text throughout the interface.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                font-size: 0.875rem • color: #6b7280 • line-height: 1.5
              </p>
            </div>

            <div>
              <code style={{ 
                fontSize: '0.875rem', 
                color: '#DC2626',
                backgroundColor: '#fef2f2',
                padding: '0.125rem 0.375rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>
                Inline Code
              </code>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                font-family: monospace • color: #DC2626 • background: #fef2f2
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECTION 3: BUTTONS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            3. Buttons
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Primary Buttons */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Primary Buttons (.btn-primary)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s'
                }}>
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  Primary Button
                </button>
                
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                  Small Button
                </button>

                <button disabled style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'not-allowed',
                  opacity: 0.5
                }}>
                  Disabled
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Used for primary actions • #1A5276 background • white text • 0.5rem border-radius
              </p>
            </div>

            {/* Secondary Buttons */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Outline Buttons (.btn-outline)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#1A5276',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: '1px solid #1A5276',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s'
                }}>
                  <Filter style={{ width: '1rem', height: '1rem' }} />
                  Outline Button
                </button>

                <button disabled style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#1A5276',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: '1px solid #1A5276',
                  cursor: 'not-allowed',
                  opacity: 0.5
                }}>
                  Disabled
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Used for secondary actions • transparent background • #1A5276 border & text
              </p>
            </div>

            {/* Danger Buttons */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Danger Buttons (.btn-danger)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <X style={{ width: '1rem', height: '1rem' }} />
                  Delete
                </button>

                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#DC2626',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: '1px solid #DC2626',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Used for destructive actions • #DC2626 background • white text
              </p>
            </div>

            {/* Filter Buttons */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Filter Buttons (.filter-btn)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #1A5276',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}>
                  Active Filter
                </button>
                <button style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}>
                  Inactive Filter
                </button>
                <button style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  All Categories
                </button>
                <button style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Filter Option
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Used for filtering data • Active: #1A5276 • Inactive: white with gray border
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECTION 4: FORM COMPONENTS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            4. Form Components
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Text Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Text Input (.form-input)
              </label>
              <input
                type="text"
                placeholder="Enter text..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#111827',
                  fontSize: '0.875rem',
                  transition: 'all 0.15s'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Standard text input • Focus state shows #1A5276 border with ring
              </p>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Textarea (.form-textarea)
              </label>
              <textarea
                placeholder="Enter description..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#111827',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  transition: 'all 0.15s'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Multi-line text input • Vertical resize only
              </p>
            </div>

            {/* Select Dropdown */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Select Dropdown (.form-select)
              </label>
              <select
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#111827',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <option>Select an option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Dropdown select • Consistent styling with inputs
              </p>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Search Input
              </label>
              <div style={{ position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  width: '1rem', 
                  height: '1rem',
                  color: '#6b7280'
                }} />
                <input
                  type="text"
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    color: '#111827',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Search input with icon • Padding adjusted for icon
              </p>
            </div>

            {/* Error State */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#111827',
                marginBottom: '0.5rem'
              }}>
                Input with Error
              </label>
              <input
                type="text"
                placeholder="Invalid input..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #DC2626',
                  borderRadius: '0.375rem',
                  backgroundColor: '#fef2f2',
                  color: '#111827',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                This field is required
              </p>
            </div>

            {/* Disabled State */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#9ca3af',
                marginBottom: '0.5rem'
              }}>
                Disabled Input
              </label>
              <input
                type="text"
                placeholder="Disabled..."
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f9fafb',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  cursor: 'not-allowed'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Disabled state • Gray background • Not editable
              </p>
            </div>
          </div>
        </section>

        {/* ========== SECTION 5: CARDS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            5. Cards
          </h2>

          {/* Professional Card */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Professional Card (.professional-card)
            </h3>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
              transition: 'box-shadow 0.15s'
            }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Card Title
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                This is a professional card component used for displaying content throughout the application. It has consistent padding, border, and shadow.
              </p>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
              Base card • White background • Subtle shadow • Hover effect increases shadow
            </p>
          </div>

          {/* List Card (Horizontal) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              List Card (.list-card .list-card-horizontal)
            </h3>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
              border: '1px solid #e5e7eb',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              minHeight: '5rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              {/* Avatar */}
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#1A5276',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
                  AC
                </span>
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                  Acme Corporation
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span style={{ fontWeight: '500', color: '#1A5276' }}>Technology</span>
                  <span style={{ fontSize: '0.75rem' }}>25 projects</span>
                  <span style={{ 
                    padding: '0.125rem 0.5rem', 
                    backgroundColor: '#dcfce7', 
                    color: '#166534',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    8.5/10
                  </span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
              Used for vendor/project/client lists • Horizontal layout • Avatar + content • Hover lifts card
            </p>
          </div>

          {/* Stat Card */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Stat Card (.stat-card)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Briefcase style={{ width: '2rem', height: '2rem', color: '#1A5276' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  127
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Total Projects
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Users style={{ width: '2rem', height: '2rem', color: '#059669' }} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                  42
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Active Vendors
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
              Dashboard statistics • Icon + number + label • Clickable • Hover effect
            </p>
          </div>
        </section>

        {/* ========== SECTION 6: BADGES ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            6. Badges & Status Indicators
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Status Badges */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Status Badges (.badge-success, .badge-warning, .badge-error)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                  Success
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                  Warning
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  <XCircle style={{ width: '1rem', height: '1rem' }} />
                  Error
                </span>

                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#E8F4F8',
                  color: '#1A5276',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  <Check style={{ width: '1rem', height: '1rem' }} />
                  Primary
                </span>
              </div>
            </div>

            {/* Rating Badges */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Rating Badges
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  8.5/10
                </span>

                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  No ratings
                </span>
              </div>
            </div>

            {/* Timeline Badges */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Timeline Status Badges
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#dcfce7',
                  color: '#065f46',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  ✓ Early
                </span>

                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  → On-Time
                </span>

                <span style={{
                  padding: '0.125rem 0.5rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  ⚠ Late
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SECTION 7: AVATARS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            7. Avatars
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Avatar Sizes (.list-card-avatar)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              {/* Large */}
              <div>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: '#1A5276',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                    LG
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  Large (4rem)
                </p>
              </div>

              {/* Medium (Default) */}
              <div>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: '#1A5276',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>
                    MD
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  Medium (3rem)
                </p>
              </div>

              {/* Small */}
              <div>
                <div style={{
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#1A5276',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>
                    SM
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  Small (2rem)
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
              Square avatars with rounded corners (0.5rem) • Professional Blue background • White text
            </p>
          </div>
        </section>

        {/* ========== SECTION 8: LOADING STATES ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            8. Loading States
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Spinner */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Spinner (.spinner)
              </h3>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    border: '2px solid #1A5276',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                    Medium
                  </p>
                </div>
                
                <div>
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    border: '2px solid #1A5276',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                    Small
                  </p>
                </div>

                <div>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    border: '3px solid #1A5276',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                    Large
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                Loading spinner • Professional Blue • Animated rotation
              </p>
            </div>

            {/* Empty State */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Empty State
              </h3>
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                border: '2px dashed #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <div style={{ 
                  display: 'inline-flex',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '50%',
                  marginBottom: '1rem'
                }}>
                  <Briefcase style={{ width: '2rem', height: '2rem', color: '#6b7280' }} />
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  No projects yet
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Get started by creating your first project
                </p>
                <button style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  Create Project
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                Empty state • Icon + message + CTA button • Dashed border
              </p>
            </div>
          </div>

          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </section>

        {/* ========== SECTION 9: TABLES ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            9. Tables
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            overflowX: 'auto'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Data Table (.data-table)
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ 
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    Category
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>
                    Acme Corporation
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    Technology
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      8.5/10
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>
                    Global Services Inc
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    Consulting
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Pending
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      No ratings
                    </span>
                  </td>
                </tr>
                <tr style={{ transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>
                    Design Studio
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    Creative
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      9.2/10
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
              Data table • Gray header background • Row hover effects • Consistent cell padding
            </p>
          </div>
        </section>

        {/* ========== SECTION 10: MODALS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            10. Modals
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              Modal Structure
            </h3>
            
            {/* Modal Preview */}
            <div style={{ position: 'relative', minHeight: '400px', border: '2px dashed #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {/* Simulated Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
              }}>
                {/* Modal Content */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  maxWidth: '500px',
                  width: '100%',
                  maxHeight: '90%',
                  overflow: 'auto',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                }}>
                  {/* Modal Header */}
                  <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      Modal Title
                    </h3>
                    <button style={{
                      padding: '0.5rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '0.375rem',
                      color: '#6b7280'
                    }}>
                      <X style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5', marginBottom: '1rem' }}>
                      This is the modal content area where you can display forms, information, or any other content that needs user attention.
                    </p>
                    
                    {/* Example Form Content */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>
                        Example Input
                      </label>
                      <input
                        type="text"
                        placeholder="Enter value..."
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#111827',
                        marginBottom: '0.5rem'
                      }}>
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem'
                  }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'transparent',
                      color: '#1A5276',
                      fontWeight: '500',
                      borderRadius: '0.5rem',
                      border: '1px solid #1A5276',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      Cancel
                    </button>
                    <button style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#1A5276',
                      color: 'white',
                      fontWeight: '500',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
              Modal structure • Dark overlay (rgba(0,0,0,0.5)) • White content card • Header/Body/Footer sections • Max-width 90% viewport • Centered on screen
            </p>

            <div style={{ 
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                Modal Best Practices:
              </h4>
              <ul style={{ fontSize: '0.875rem', color: '#6b7280', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                <li>Header: Title + close button (X icon)</li>
                <li>Body: Main content, forms, scrollable if needed</li>
                <li>Footer: Action buttons (Cancel + Primary action)</li>
                <li>Overlay: Click outside to close</li>
                <li>Max-height: 90vh to prevent overflow</li>
                <li>Consistent padding: 1.5rem throughout</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========== SECTION 11: WIZARDS & MULTI-STEP FORMS ========== */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '1rem',
            borderBottom: '2px solid #1A5276',
            paddingBottom: '0.5rem'
          }}>
            11. Wizards & Multi-Step Forms
          </h2>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Step Indicators */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Step Indicators (ViRA Match, CSV Upload)
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                {/* Completed Step */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#6B8F71',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '0.875rem'
                  }}>
                    <Check style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Step 1</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>Completed</div>
                  </div>
                </div>

                {/* Connector Line - Completed */}
                <div style={{ flex: 1, height: '2px', backgroundColor: '#6B8F71', minWidth: '40px' }} />

                {/* Current Step */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#1A5276',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#1A5276', fontWeight: '500' }}>Current</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>In Progress</div>
                  </div>
                </div>

                {/* Connector Line - Upcoming */}
                <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb', minWidth: '40px' }} />

                {/* Future Step */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    color: '#6E6F71',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb'
                  }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Step 3</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Upcoming</div>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Completed: Green (#6B8F71) • Current: Blue (#1A5276) • Upcoming: Gray (#6E6F71)
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Progress Bar
              </h3>
              
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#111827', fontWeight: '500' }}>Step 2 of 3</span>
                <span style={{ color: '#6b7280' }}>66% Complete</span>
              </div>
              
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '66%', 
                  height: '100%', 
                  background: 'linear-gradient(to right, #6B8F71 50%, #1A5276 50%)',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Completed sections: Green (#6B8F71) • Active section: Blue (#1A5276) • Upcoming: Light gray
              </p>
            </div>

            {/* Wizard Navigation Buttons */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Wizard Navigation
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ← Back
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#1A5276',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    border: '1px solid #1A5276',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}>
                    Save Draft
                  </button>

                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1A5276',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    Continue →
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Back: Gray outline • Save: Blue outline • Continue: Blue solid
              </p>
            </div>

            {/* Completion State */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                Completion State
              </h3>
              
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                border: '2px solid #6B8F71',
                borderRadius: '0.5rem',
                backgroundColor: '#f0fdf4'
              }}>
                <div style={{ 
                  display: 'inline-flex',
                  padding: '1rem',
                  backgroundColor: '#6B8F71',
                  borderRadius: '50%',
                  marginBottom: '1rem'
                }}>
                  <Check style={{ width: '2rem', height: '2rem', color: 'white' }} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  All Done!
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                  Your submission has been completed successfully.
                </p>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6B8F71',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}>
                  View Results
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Success state uses Green (#6B8F71) • Light green background • Checkmark icon
              </p>
            </div>
          </div>

          {/* Color Usage Summary */}
          <div style={{ 
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#E8F4F8',
            borderRadius: '0.5rem',
            border: '1px solid #1A5276'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1A5276', marginBottom: '1rem' }}>
              📘 Wizard Color System Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  🔵 Blue (#1A5276) - "SINGLE"
                </div>
                <ul style={{ color: '#6b7280', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                  <li>Current step indicator</li>
                  <li>Active progress section</li>
                  <li>Primary "Continue" button</li>
                  <li>Active form focus states</li>
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  🟢 Green (#6B8F71) - "THROW"
                </div>
                <ul style={{ color: '#6b7280', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                  <li>Completed step indicators</li>
                  <li>Completed progress sections</li>
                  <li>Success/completion states</li>
                  <li>Final "View Results" button</li>
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  ⚫ Gray (#6E6F71) - "MARKETING"
                </div>
                <ul style={{ color: '#6b7280', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                  <li>Future/upcoming steps</li>
                  <li>Disabled states</li>
                  <li>"Back" button text</li>
                  <li>Helper text and labels</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
