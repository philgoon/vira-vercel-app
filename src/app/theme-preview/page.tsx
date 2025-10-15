'use client';

import { useState } from 'react';
import { Star, TrendingUp, Users, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ViRA Theme Options
          </h1>
          <p className="text-gray-600">
            Compare three professional themes side-by-side
          </p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          <ThemePreview themeKey="professional" />
          <ThemePreview themeKey="modern" />
          <ThemePreview themeKey="warm" />
        </div>

        <div className="mt-8 bg-white rounded-lg p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Comparison
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <div className="font-semibold text-gray-900">Professional Blue</div>
                <div className="text-sm text-gray-600">Uses your current colors (#1A5276, #6B8F71)</div>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
            </div>
            <div className="flex justify-between items-start pb-3 border-b">
              <div>
                <div className="font-semibold text-gray-900">Modern Slate</div>
                <div className="text-sm text-gray-600">Dark mode, tech-forward aesthetic</div>
              </div>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Modern</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-900">Warm Professional</div>
                <div className="text-sm text-gray-600">Approachable with warm tones</div>
              </div>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
