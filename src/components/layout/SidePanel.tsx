'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * SidePanel Component
 *
 * A right-sliding overlay panel built entirely in STM tokens (no Tailwind).
 * Used for detail views: vendor details, project details, ratings history, etc.
 *
 * Features:
 * - Slides in from right with smooth animation
 * - Backdrop overlay with click-to-close
 * - Escape key support
 * - Scrollable content area
 * - Optional footer section for actions
 * - Fully accessible
 *
 * Example usage:
 * ```tsx
 * <SidePanel
 *   isOpen={isVendorOpen}
 *   onClose={() => setIsVendorOpen(false)}
 *   title="Vendor Details"
 * >
 *   <div className="stm-panel-section">
 *     <h3 className="stm-panel-section-title">Overview</h3>
 *     Content here
 *   </div>
 * </SidePanel>
 * ```
 */
export function SidePanel({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: SidePanelProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay - triggers close on click */}
      <div
        className={`stm-panel-overlay ${isOpen ? 'stm-panel-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel Container */}
      <div
        className={`stm-panel ${isOpen ? 'stm-panel-open' : ''} ${className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="stm-panel-header">
          <h2 id="panel-title" className="stm-panel-title">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="stm-panel-close"
            aria-label="Close panel"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="stm-panel-body">{children}</div>

        {/* Footer (optional) */}
        {footer && <div className="stm-panel-footer">{footer}</div>}
      </div>
    </>
  );
}

/**
 * Helper components for common panel patterns
 */

interface SidePanelSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SidePanelSection({ title, children }: SidePanelSectionProps) {
  return (
    <div className="stm-panel-section">
      {title && <h3 className="stm-panel-section-title">{title}</h3>}
      <div className="stm-panel-section-content">{children}</div>
    </div>
  );
}

interface SidePanelFieldProps {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}

export function SidePanelField({ label, value, muted }: SidePanelFieldProps) {
  return (
    <div className="stm-panel-field">
      <label className="stm-panel-field-label">{label}</label>
      <div className={`stm-panel-field-value ${muted ? 'stm-panel-field-muted' : ''}`}>
        {value}
      </div>
    </div>
  );
}

interface SidePanelTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function SidePanelTabs({ tabs, activeTabId, onTabChange }: SidePanelTabsProps) {
  return (
    <>
      <div className="stm-panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`stm-panel-tab ${activeTabId === tab.id ? 'stm-panel-tab-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </div>
    </>
  );
}

interface SidePanelFooterActionProps {
  onClick: () => void;
  label: string;
  variant?: 'default' | 'primary';
  disabled?: boolean;
}

export function SidePanelFooterAction({
  onClick,
  label,
  variant = 'default',
  disabled,
}: SidePanelFooterActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`stm-panel-footer-action ${
        variant === 'primary' ? 'stm-panel-footer-action-primary' : ''
      }`}
      type="button"
    >
      {label}
    </button>
  );
}
