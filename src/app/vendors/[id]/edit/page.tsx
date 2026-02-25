'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Vendor } from '@/types';

const CATEGORIES = [
  { value: 'content',       label: 'Content Creation' },
  { value: 'data',          label: 'Data Analysis' },
  { value: 'graphic_design',label: 'Graphic Design' },
  { value: 'paid_media',    label: 'Paid Media' },
  { value: 'proofreading',  label: 'Proofreading' },
  { value: 'seo',           label: 'SEO' },
  { value: 'social_media',  label: 'Social Media' },
  { value: 'webdev',        label: 'Web Development' },
];

const AVAILABILITY_OPTIONS = ['Available', 'Limited', 'On Leave', 'Unavailable'];
const PRICING_OPTIONS = ['Hourly', 'Per Project', 'Retainer', 'Monthly', 'Custom'];
const STATUS_OPTIONS = ['active', 'inactive'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--stm-space-3)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-md)',
  fontSize: 'var(--stm-text-sm)',
  fontFamily: 'var(--stm-font-body)',
  backgroundColor: 'var(--stm-background)',
  color: 'var(--stm-foreground)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--stm-muted-foreground)',
  marginBottom: '6px',
  fontFamily: 'var(--stm-font-body)',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--stm-card)',
  border: '1px solid var(--stm-border)',
  borderRadius: 'var(--stm-radius-lg)',
  padding: '20px 24px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '700',
  color: 'var(--stm-foreground)',
  marginBottom: '16px',
  fontFamily: 'var(--stm-font-body)',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--stm-border)',
};

interface FormData {
  vendor_name: string;
  primary_contact: string;
  email: string;
  status: string;
  service_categories: string[];
  skills: string;
  pricing_structure: string;
  rate_cost: string;
  availability_status: string;
  availability_notes: string;
  available_from: string;
  industry: string;
  portfolio_url: string;
}

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    vendor_name: '',
    primary_contact: '',
    email: '',
    status: 'active',
    service_categories: [],
    skills: '',
    pricing_structure: '',
    rate_cost: '',
    availability_status: '',
    availability_notes: '',
    available_from: '',
    industry: '',
    portfolio_url: '',
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
          primary_contact: vendorData.primary_contact || '',
          email: vendorData.email || '',
          status: vendorData.status || 'active',
          service_categories: vendorData.service_categories || [],
          skills: vendorData.skills || '',
          pricing_structure: vendorData.pricing_structure || '',
          rate_cost: vendorData.rate_cost || '',
          availability_status: vendorData.availability_status || '',
          availability_notes: vendorData.availability_notes || '',
          available_from: vendorData.available_from ? vendorData.available_from.split('T')[0] : '',
          industry: vendorData.industry || '',
          portfolio_url: vendorData.portfolio_url || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendor');
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [id]);

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      service_categories: prev.service_categories.includes(cat)
        ? prev.service_categories.filter(c => c !== cat)
        : [...prev.service_categories, cat],
    }));
  };

  const handleSave = async () => {
    if (!formData.vendor_name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      // Coerce empty strings to null for optional fields so Supabase doesn't reject them
      const payload = {
        vendor_id: id,
        ...formData,
        available_from: formData.available_from || null,
        availability_status: formData.availability_status || null,
        pricing_structure: formData.pricing_structure || null,
        portfolio_url: formData.portfolio_url || null,
        industry: formData.industry || null,
        rate_cost: formData.rate_cost || null,
        availability_notes: formData.availability_notes || null,
        skills: formData.skills || null,
        primary_contact: formData.primary_contact || null,
        email: formData.email || null,
      };
      const response = await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save changes');
      setSuccess(true);
      setTimeout(() => router.push(`/vendors/${id}`), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 'var(--stm-space-8)', display: 'flex', justifyContent: 'center' }}>
      <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center' }}>
        <span className="stm-loader-capsule stm-loader-dot" />
        <span className="stm-loader-capsule stm-loader-dot" />
        <span className="stm-loader-capsule stm-loader-dot" />
        <span className="stm-loader-capsule stm-loader-dash" />
        <span className="stm-loader-capsule stm-loader-dash" />
        <span className="stm-loader-capsule stm-loader-dash" />
      </div>
    </div>
  );

  if (!vendor) return (
    <div style={{ padding: 'var(--stm-space-8)', color: 'var(--stm-error)', fontFamily: 'var(--stm-font-body)' }}>
      {error || 'Vendor not found'}
    </div>
  );

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--stm-space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)' }}>
          <button
            onClick={() => router.push(`/vendors/${id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', cursor: 'pointer', fontSize: '12px', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}
          >
            <ArrowLeft style={{ width: '13px', height: '13px' }} />
            Back
          </button>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
              Edit Vendor
            </div>
            <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '3px', fontFamily: 'var(--stm-font-body)' }}>
              {vendor.vendor_name}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !formData.vendor_name.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px',
            backgroundColor: success ? 'var(--stm-success)' : 'var(--stm-primary)',
            color: 'white', border: 'none',
            borderRadius: 'var(--stm-radius-md)',
            cursor: saving || !formData.vendor_name.trim() ? 'not-allowed' : 'pointer',
            opacity: saving || !formData.vendor_name.trim() ? 0.6 : 1,
            fontFamily: 'var(--stm-font-body)',
            fontSize: '12px', fontWeight: '700',
            letterSpacing: '0.04em',
            transition: 'background-color 0.2s',
          }}
        >
          <Save style={{ width: '13px', height: '13px' }} />
          {saving ? 'Saving...' : success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius-md)', fontSize: '13px', color: 'var(--stm-error)', fontFamily: 'var(--stm-font-body)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>

        {/* Basic Info */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Vendor Name *</label>
              <input
                type="text"
                value={formData.vendor_name}
                onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Primary Contact</label>
              <input
                type="text"
                value={formData.primary_contact}
                onChange={e => setFormData({ ...formData, primary_contact: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Marketing, Technology"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Service Categories</div>
          <p style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginBottom: '12px', fontFamily: 'var(--stm-font-body)' }}>
            Select all categories this vendor can deliver. ViRA Match uses these to find vendors for each project type.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => {
              const selected = formData.service_categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${selected ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                    backgroundColor: selected ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-background)',
                    color: selected ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
                    fontSize: '12px',
                    fontWeight: selected ? '700' : '500',
                    cursor: 'pointer',
                    fontFamily: 'var(--stm-font-body)',
                    transition: 'all 0.14s',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          {formData.service_categories.length === 0 && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--stm-warning)', fontFamily: 'var(--stm-font-body)' }}>
              No categories selected — this vendor won't appear in ViRA Match results.
            </div>
          )}
        </div>

        {/* Skills & Expertise */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Skills & Expertise</div>
          <div>
            <label style={labelStyle}>Skills</label>
            <textarea
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. SEO, keyword research, on-page optimization, technical audits, link building..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
              Detailed skills help ViRA Match surface this vendor for relevant projects.
            </div>
          </div>
          <div style={{ marginTop: '14px' }}>
            <label style={labelStyle}>Portfolio URL</label>
            <input
              type="url"
              value={formData.portfolio_url}
              onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })}
              placeholder="https://"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Pricing */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Pricing</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Pricing Structure</label>
              <select
                value={formData.pricing_structure}
                onChange={e => setFormData({ ...formData, pricing_structure: e.target.value })}
                style={inputStyle}
              >
                <option value="">Select...</option>
                {PRICING_OPTIONS.map(p => (
                  <option key={p} value={p.toLowerCase().replace(' ', '_')}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Rate / Cost</label>
              <input
                type="text"
                value={formData.rate_cost}
                onChange={e => setFormData({ ...formData, rate_cost: e.target.value })}
                placeholder="e.g. $125/hr, $2,500/project"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Availability</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Availability Status</label>
              <select
                value={formData.availability_status}
                onChange={e => setFormData({ ...formData, availability_status: e.target.value })}
                style={inputStyle}
              >
                <option value="">Not set</option>
                {AVAILABILITY_OPTIONS.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Available From</label>
              <input
                type="date"
                value={formData.available_from}
                onChange={e => setFormData({ ...formData, available_from: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Availability Notes</label>
              <textarea
                value={formData.availability_notes}
                onChange={e => setFormData({ ...formData, availability_notes: e.target.value })}
                placeholder="e.g. Available for new projects starting Q2, limited to 2 projects at a time..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
