// [M2] Sprint 3: Client Profile Modal
// Purpose: Admin-only modal for editing client profile information
// Features: Industry, target audience, brand voice, marketing brief, budget range, notes

'use client';

import { useState, useEffect } from 'react';
import { X, Save, Building2, Users, MessageSquare, FileText, DollarSign, StickyNote } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Call onSave with updated client data
      onSave({
        ...client,
        ...formData,
      });

      onClose();
    } catch (err: any) {
      console.error('Error updating client profile:', err);
      setError(err.message || 'Failed to update client profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Client Profile</h2>
              <p className="text-sm text-gray-600">{client.client_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Industry / Sector
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Healthcare, Technology, Retail, Finance"
            />
            <p className="text-xs text-gray-500 mt-1">Client's primary industry or business sector</p>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Audience
            </label>
            <textarea
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the client's target audience demographics, interests, and behaviors..."
            />
            <p className="text-xs text-gray-500 mt-1">Who is this client trying to reach?</p>
          </div>

          {/* Brand Voice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Brand Voice / Tone
            </label>
            <input
              type="text"
              value={formData.brand_voice}
              onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Professional, Casual, Technical, Friendly, Authoritative"
            />
            <p className="text-xs text-gray-500 mt-1">Communication style and tone preferences</p>
          </div>

          {/* Marketing Brief */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Marketing Brief / Strategy
            </label>
            <textarea
              value={formData.marketing_brief}
              onChange={(e) => setFormData({ ...formData, marketing_brief: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the client's marketing goals, strategy, key messaging, and objectives..."
            />
            <p className="text-xs text-gray-500 mt-1">Overall marketing strategy and goals</p>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Typical Budget Range
            </label>
            <select
              value={formData.budget_range}
              onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select budget range...</option>
              <option value="Under $5k">Under $5k</option>
              <option value="$5k - $10k">$5k - $10k</option>
              <option value="$10k - $25k">$10k - $25k</option>
              <option value="$25k - $50k">$25k - $50k</option>
              <option value="$50k - $100k">$50k - $100k</option>
              <option value="$100k+">$100k+</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Typical project budget range for this client</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional context, preferences, or important information about this client..."
            />
            <p className="text-xs text-gray-500 mt-1">Internal notes and context</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
