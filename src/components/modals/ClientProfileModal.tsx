// [M2] Sprint 3: Client Profile Modal
// Purpose: Admin-only modal for editing client profile information
// Features: Industry, target audience, brand voice, marketing brief, budget range, notes

'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, MessageSquare, FileText, DollarSign, StickyNote } from 'lucide-react';
import { SidePanel, SidePanelSection, SidePanelFooterAction } from '@/components/layout/SidePanel';
import { Client } from '@/types';

interface ClientProfileModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
}

export default function ClientProfileModal({ client, isOpen, onClose, onSave }: ClientProfileModalProps) {
  const [formData, setFormData] = useState({
    industry: client.industry || '',
    target_audience: client.target_audience || '',
    brand_voice: client.brand_voice || '',
    marketing_brief: client.marketing_brief || '',
    budget_range: client.budget_range || '',
    notes: client.notes || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        industry: client.industry || '',
        target_audience: client.target_audience || '',
        brand_voice: client.brand_voice || '',
        marketing_brief: client.marketing_brief || '',
        budget_range: client.budget_range || '',
        notes: client.notes || '',
      });
      setError(null);
    }
  }, [isOpen, client]);

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.client_key,
          client_name: client.client_name,
          industry: formData.industry || null,
          target_audience: formData.target_audience || null,
          brand_voice: formData.brand_voice || null,
          marketing_brief: formData.marketing_brief || null,
          budget_range: formData.budget_range || null,
          notes: formData.notes || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update client profile');
      }

      onSave({ ...client, ...formData });
      onClose();
    } catch (err: any) {
      console.error('Error updating client profile:', err);
      setError(err.message || 'Failed to update client profile');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    padding: 'var(--stm-space-3) var(--stm-space-3)',
    fontSize: 'var(--stm-text-sm)',
    border: '1px solid var(--stm-border)',
    borderRadius: 'var(--stm-radius-md)',
    backgroundColor: 'var(--stm-background)',
    color: 'var(--stm-foreground)',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--stm-space-2)',
    fontSize: 'var(--stm-text-sm)',
    fontWeight: 'var(--stm-font-medium)',
    color: 'var(--stm-foreground)',
    marginBottom: 'var(--stm-space-2)',
  };

  const hintStyle = {
    fontSize: 'var(--stm-text-xs)',
    color: 'var(--stm-muted-foreground)',
    marginTop: 'var(--stm-space-1)',
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile: ${client.client_name}`}
      footer={
        <>
          <SidePanelFooterAction onClick={onClose} label="Cancel" disabled={isSaving} />
          <SidePanelFooterAction
            onClick={handleSubmit}
            label={isSaving ? 'Saving...' : 'Save Profile'}
            variant="primary"
            disabled={isSaving}
          />
        </>
      }
    >
      {error && (
        <div style={{
          padding: 'var(--stm-space-3) var(--stm-space-4)',
          backgroundColor: 'color-mix(in srgb, var(--stm-error) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--stm-error) 30%, transparent)',
          borderRadius: 'var(--stm-radius-md)',
          marginBottom: 'var(--stm-space-4)',
          fontSize: 'var(--stm-text-sm)',
          color: 'var(--stm-error)',
        }}>
          {error}
        </div>
      )}

      <SidePanelSection title="Business Context">
        {/* Industry */}
        <div>
          <div style={labelStyle}>
            <Building2 style={{ width: '14px', height: '14px' }} />
            Industry / Sector
          </div>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            style={fieldStyle}
            placeholder="e.g., Healthcare, Technology, Retail, Finance"
          />
          <div style={hintStyle}>Client's primary industry or business sector</div>
        </div>

        {/* Budget Range */}
        <div>
          <div style={labelStyle}>
            <DollarSign style={{ width: '14px', height: '14px' }} />
            Typical Budget Range
          </div>
          <select
            value={formData.budget_range}
            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
            style={fieldStyle}
          >
            <option value="">Select budget range...</option>
            <option value="Under $5k">Under $5k</option>
            <option value="$5k - $10k">$5k - $10k</option>
            <option value="$10k - $25k">$10k - $25k</option>
            <option value="$25k - $50k">$25k - $50k</option>
            <option value="$50k - $100k">$50k - $100k</option>
            <option value="$100k+">$100k+</option>
          </select>
          <div style={hintStyle}>Typical project budget range for this client</div>
        </div>
      </SidePanelSection>

      <SidePanelSection title="Audience & Voice">
        {/* Target Audience */}
        <div>
          <div style={labelStyle}>
            <Users style={{ width: '14px', height: '14px' }} />
            Target Audience
          </div>
          <textarea
            value={formData.target_audience}
            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical' as const, minHeight: '80px' }}
            placeholder="Describe the client's target audience demographics, interests, and behaviors..."
          />
          <div style={hintStyle}>Who is this client trying to reach?</div>
        </div>

        {/* Brand Voice */}
        <div>
          <div style={labelStyle}>
            <MessageSquare style={{ width: '14px', height: '14px' }} />
            Brand Voice / Tone
          </div>
          <input
            type="text"
            value={formData.brand_voice}
            onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
            style={fieldStyle}
            placeholder="e.g., Professional, Casual, Technical, Friendly, Authoritative"
          />
          <div style={hintStyle}>Communication style and tone preferences</div>
        </div>
      </SidePanelSection>

      <SidePanelSection title="Strategy & Notes">
        {/* Marketing Brief */}
        <div>
          <div style={labelStyle}>
            <FileText style={{ width: '14px', height: '14px' }} />
            Marketing Brief / Strategy
          </div>
          <textarea
            value={formData.marketing_brief}
            onChange={(e) => setFormData({ ...formData, marketing_brief: e.target.value })}
            rows={4}
            style={{ ...fieldStyle, resize: 'vertical' as const, minHeight: '100px' }}
            placeholder="Describe the client's marketing goals, strategy, key messaging, and objectives..."
          />
          <div style={hintStyle}>Overall marketing strategy and goals</div>
        </div>

        {/* Notes */}
        <div>
          <div style={labelStyle}>
            <StickyNote style={{ width: '14px', height: '14px' }} />
            Additional Notes
          </div>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical' as const, minHeight: '80px' }}
            placeholder="Any additional context, preferences, or important information about this client..."
          />
          <div style={hintStyle}>Internal notes and context</div>
        </div>
      </SidePanelSection>
    </SidePanel>
  );
}
