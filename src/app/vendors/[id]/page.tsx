'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, MapPin, Tag, Edit } from 'lucide-react';
import { Vendor } from '@/types';

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

export default function VendorDetailsPage({ params }: VendorPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/vendors?id=${id}`);
        const data = await response.json();
        const vendorData = data.vendors?.find((v: Vendor) => v.vendor_id.toString() === id);
        if (!vendorData) setNotFound(true);
        else setVendor(vendorData);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--stm-page-background)' }}>
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
  }

  if (notFound || !vendor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--stm-page-background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--stm-text-lg)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-4)' }}>
            Vendor not found
          </div>
          <button
            onClick={() => router.push('/vendors')}
            style={{ padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-primary)', color: 'white', border: 'none', borderRadius: 'var(--stm-radius-md)', cursor: 'pointer', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)' }}
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  const initials = vendor.vendor_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const categories = Array.isArray(vendor.service_categories) ? vendor.service_categories : [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--stm-page-background)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--stm-card)', borderBottom: '1px solid var(--stm-border)', padding: 'var(--stm-space-6)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push('/vendors')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', padding: 'var(--stm-space-2)', background: 'none', border: 'none', color: 'var(--stm-primary)', cursor: 'pointer', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Back to Vendors
          </button>
          <button
            onClick={() => router.push(`/vendors/${id}/edit`)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', padding: 'var(--stm-space-2) var(--stm-space-4)', backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', cursor: 'pointer', fontFamily: 'var(--stm-font-body)', fontSize: 'var(--stm-text-sm)' }}
          >
            <Edit style={{ width: '14px', height: '14px' }} />
            Edit
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--stm-space-8)' }}>
        {/* Vendor Card */}
        <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: 'var(--stm-space-8)', marginBottom: 'var(--stm-space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--stm-space-6)' }}>
            {/* Avatar */}
            <div style={{ width: '64px', height: '64px', borderRadius: 'var(--stm-radius-full)', background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 'var(--stm-text-xl)', fontWeight: 'var(--stm-font-bold)', color: 'white' }}>{initials}</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--stm-text-2xl)', fontWeight: 'var(--stm-font-bold)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)', marginBottom: 'var(--stm-space-1)' }}>
                {vendor.vendor_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-3)', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '2px var(--stm-space-3)',
                  borderRadius: 'var(--stm-radius-full)',
                  fontSize: 'var(--stm-text-xs)',
                  fontWeight: 'var(--stm-font-semibold)',
                  fontFamily: 'var(--stm-font-body)',
                  backgroundColor: vendor.status === 'Active' ? 'color-mix(in srgb, var(--stm-success) 12%, transparent)' : 'var(--stm-muted)',
                  color: vendor.status === 'Active' ? 'var(--stm-success)' : 'var(--stm-muted-foreground)',
                }}>
                  {vendor.status ?? 'Unknown'}
                </span>
                {categories.map((cat: string) => (
                  <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                    <Tag style={{ width: '11px', height: '11px' }} />{cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--stm-space-4)' }}>
          {vendor.primary_contact && (
            <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', padding: 'var(--stm-space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-1)' }}>
                <Building2 style={{ width: '14px', height: '14px', color: 'var(--stm-muted-foreground)' }} />
                <div style={{ fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--stm-font-body)' }}>Contact</div>
              </div>
              <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>{vendor.primary_contact}</div>
            </div>
          )}
          {vendor.email && (
            <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)', padding: 'var(--stm-space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-2)', marginBottom: 'var(--stm-space-1)' }}>
                <Mail style={{ width: '14px', height: '14px', color: 'var(--stm-muted-foreground)' }} />
                <div style={{ fontSize: 'var(--stm-text-xs)', fontWeight: 'var(--stm-font-semibold)', color: 'var(--stm-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--stm-font-body)' }}>Email</div>
              </div>
              <div style={{ fontSize: 'var(--stm-text-sm)', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>{vendor.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
