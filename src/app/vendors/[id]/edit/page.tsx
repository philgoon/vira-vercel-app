'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Vendor } from '@/types';

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_name: '',
    contact_email: '',
    location: '',
    status: 'Active',
    specialties: ''
  });

  useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/vendors?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch vendor');
        
        const data = await response.json();
        const vendorData = data.vendors?.find((v: Vendor) => v.vendor_id.toString() === id);
        
        if (!vendorData) throw new Error('Vendor not found');
        
        setVendor(vendorData);
        setFormData({
          vendor_name: vendorData.vendor_name || '',
          contact_name: vendorData.contact_name || '',
          contact_email: vendorData.contact_email || '',
          location: vendorData.location || '',
          status: vendorData.status || 'Active',
          specialties: vendorData.specialties || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendor');
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: id,
          ...formData
        })
      });

      if (!response.ok) throw new Error('Failed to save changes');
      
      router.push(`/vendors/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  if (!vendor) return <div style={{ padding: '2rem' }}>Vendor not found</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.push(`/vendors/${id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#1A5276',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
              Back
            </button>
            
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1A5276' }}>
              Edit Vendor
            </h1>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1A5276',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            <Save style={{ width: '1rem', height: '1rem' }} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="professional-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label className="form-label">Vendor Name</label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Testing">Testing</option>
              </select>
            </div>

            <div>
              <label className="form-label">Specialties</label>
              <textarea
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}