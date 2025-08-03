'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Building, Calendar, MapPin, User, Phone, Mail } from 'lucide-react';
import { Client } from '@/types';

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        console.log('Fetching client with ID:', id);
        const response = await fetch(`/api/clients?id=${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch client');
        }

        const data = await response.json();
        const clientData = data.clients?.find((c: Client) => c.client_key.toString() === id);

        if (!clientData) {
          throw new Error('Client not found');
        }

        setClient(clientData);
        console.log('Client loaded:', clientData);
      } catch (err) {
        console.error('Error loading client:', err);
        setError(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id]);

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

  if (error || !client) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#dc2626' }}>Error: {error || 'Client not found'}</p>
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push('/clients')}
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
              Back to Clients
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#1A5276',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                  {client.client_name.charAt(0)}
                </span>
              </div>

              <div>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#1A5276',
                  margin: 0,
                  fontFamily: 'var(--font-headline)'
                }}>
                  {client.client_name}
                </h1>
                <p style={{
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.875rem'
                }}>
                  {client.industry || 'Industry not specified'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push(`/clients/${id}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6B8F71',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            <Edit2 style={{ width: '1rem', height: '1rem' }} />
            Edit Client
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Information */}
          <div className="professional-card" style={{ padding: '2rem' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#111827'
            }}>
              Client Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Building style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Industry</label>
                </div>
                <p style={{ margin: 0, color: '#6b7280' }}>{client.industry || 'Not specified'}</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Time Zone</label>
                </div>
                <p style={{ margin: 0, color: '#6b7280' }}>{client.time_zone || 'Not specified'}</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Phone style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Preferred Contact</label>
                </div>
                <p style={{ margin: 0, color: '#6b7280' }}>{client.preferred_contact || 'Not specified'}</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar style={{ width: '1rem', height: '1rem', color: '#1A5276' }} />
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Client Since</label>
                </div>
                <p style={{ margin: 0, color: '#6b7280' }}>{formatDate(client.created_date)}</p>
              </div>
            </div>

            {client.client_notes && (
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Notes
                </label>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {client.client_notes}
                </p>
              </div>
            )}
          </div>

          {/* Statistics Card */}
          <div className="professional-card" style={{ padding: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#111827'
            }}>
              Project Statistics
            </h3>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#1A5276',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                  {client.total_projects || 0}
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Total Projects
              </p>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Last updated: {formatDate(client.updated_at)}
              </p>
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
