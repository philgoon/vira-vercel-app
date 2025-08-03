'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Client } from '@/types';

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    industry: '',
    time_zone: '',
    preferred_contact: '',
    client_notes: ''
  });

  useEffect(() => {
    async function fetchClient() {
      try {
        const response = await fetch(`/api/clients?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch client');

        const data = await response.json();
        const clientData = data.clients?.find((c: Client) => c.client_key.toString() === id);

        if (!clientData) throw new Error('Client not found');

        setClient(clientData);
        setFormData({
          client_name: clientData.client_name || '',
          industry: clientData.industry || '',
          time_zone: clientData.time_zone || '',
          preferred_contact: clientData.preferred_contact || '',
          client_notes: clientData.client_notes || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_key: id,
          ...formData,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      // Navigate back to client view page
      router.push(`/clients/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/clients/${id}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid #1A5276',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading client details...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
        </div>
        <button
          onClick={() => router.push('/clients')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1A5276',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            margin: '0 auto'
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Clients
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Client not found</p>
        <button
          onClick={() => router.push('/clients')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#1A5276',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            margin: '0 auto'
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#1A5276',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
              Back to Client
            </button>

            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1A5276',
              margin: 0,
              fontFamily: 'var(--font-headline)'
            }}>
              Edit Client
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: saving ? '#9ca3af' : '#1A5276',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <Save style={{ width: '1rem', height: '1rem' }} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>Error: {error}</p>
          </div>
        )}

        <div className="professional-card" style={{ padding: '2rem' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#111827'
          }}>
            Client Information
          </h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Client Name *
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>

              <div>
                <label className="form-label" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Time Zone
                </label>
                <select
                  value={formData.time_zone}
                  onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select time zone</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="CST">Central (CST)</option>
                  <option value="MST">Mountain (MST)</option>
                  <option value="PST">Pacific (PST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Preferred Contact Method
              </label>
              <select
                value={formData.preferred_contact}
                onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              >
                <option value="">Select preferred contact</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Slack">Slack</option>
                <option value="Teams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Notes
              </label>
              <textarea
                value={formData.client_notes}
                onChange={(e) => setFormData({ ...formData, client_notes: e.target.value })}
                className="form-textarea"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                rows={4}
                placeholder="Additional notes about the client, preferences, or important information..."
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
