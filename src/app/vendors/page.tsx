// [EPIC-002] Vendor Roster — prototype card grid layout
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Vendor, VendorsApiResponse } from '@/types';
import VendorPanel from '@/components/modals/VendorModal';
import { Search } from 'lucide-react';

// Morse code map for A-Z
const MORSE: Record<string, string> = {
  A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',
  I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',
  Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',
  Y:'-.--',Z:'--..',
};

function MorseAvatar({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase();
  const code = MORSE[letter] ?? '.-';
  return (
    <div style={{
      width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--stm-muted)', gap: '2.5px',
    }}>
      {code.split('').map((c, i) => (
        <span key={i} style={{
          display: 'block',
          borderRadius: '10px',
          backgroundColor: 'var(--stm-primary)',
          width: c === '-' ? '10px' : '4px',
          height: '4px',
          flexShrink: 0,
          opacity: 0.7,
        }} />
      ))}
    </div>
  );
}

function scoreColor(score: number | null | undefined): string {
  if (!score) return 'var(--stm-muted-foreground)';
  if (score >= 8.5) return 'var(--stm-success)';
  if (score >= 7)   return 'var(--stm-primary)';
  return 'var(--stm-warning)';
}

function formatCategory(cats: string[] | null | undefined, fallback: string | null | undefined): string {
  if (cats && cats.length > 0) return cats.slice(0, 2).map(c => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ');
  return fallback ?? 'Service Provider';
}

const AVAIL: Record<string, { bg: string; color: string; border: string; pulse: boolean }> = {
  Available:   { bg: 'color-mix(in srgb, var(--stm-success) 8%, transparent)', color: 'var(--stm-success)', border: 'color-mix(in srgb, var(--stm-success) 20%, transparent)', pulse: true },
  Limited:     { bg: 'color-mix(in srgb, var(--stm-warning) 8%, transparent)', color: 'var(--stm-warning)', border: 'color-mix(in srgb, var(--stm-warning) 20%, transparent)', pulse: false },
  'On Leave':  { bg: 'var(--stm-muted)', color: 'var(--stm-muted-foreground)', border: 'var(--stm-border)', pulse: false },
  Unavailable: { bg: 'var(--stm-muted)', color: 'var(--stm-muted-foreground)', border: 'var(--stm-border)', pulse: false },
};

export default function VendorsPage() {
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch vendors'))
      .then((data: VendorsApiResponse) => setAllVendors(data.vendors || []))
      .catch(err => setError(typeof err === 'string' ? err : 'Failed to load vendors'))
      .finally(() => setLoading(false));
  }, []);

  // All unique categories across service_categories arrays
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    allVendors.forEach(v => {
      if (v.service_categories?.length) v.service_categories.forEach(c => set.add(c));
      else if (v.vendor_type) set.add(v.vendor_type);
    });
    return [...set].sort();
  }, [allVendors]);

  // Client-side filter
  const vendors = useMemo(() => {
    let list = allVendors;
    if (selectedCategory) {
      list = list.filter(v =>
        v.service_categories?.includes(selectedCategory) ||
        v.vendor_type?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.vendor_name.toLowerCase().includes(q) ||
        v.vendor_type?.toLowerCase().includes(q) ||
        v.service_categories?.some(c => c.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allVendors, selectedCategory, search]);

  const handleSaveVendor = async (updatedVendor: Partial<Vendor>) => {
    console.log('Saving vendor:', updatedVendor);
    setIsPanelOpen(false);
    setSelectedVendor(null);
  };

  return (
    <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--stm-space-5)' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em', fontFamily: 'var(--stm-font-body)' }}>
            Vendor Roster
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', marginTop: '4px', fontFamily: 'var(--stm-font-body)' }}>
            {loading ? 'Loading...' : `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} across all service categories`}
          </div>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 'var(--stm-space-6)' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--stm-muted-foreground)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', fontFamily: 'var(--stm-font-body)',
              fontSize: '12px', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-md)',
              backgroundColor: 'var(--stm-card)', color: 'var(--stm-foreground)', outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
              border: `1px solid ${selectedCategory === '' ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
              borderRadius: '20px', cursor: 'pointer',
              backgroundColor: selectedCategory === '' ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
              color: selectedCategory === '' ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
              transition: 'all 0.14s',
            }}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
              style={{
                padding: '4px 12px', fontFamily: 'var(--stm-font-body)', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${selectedCategory === cat ? 'var(--stm-primary)' : 'var(--stm-border)'}`,
                borderRadius: '20px', cursor: 'pointer',
                backgroundColor: selectedCategory === cat ? 'color-mix(in srgb, var(--stm-primary) 10%, transparent)' : 'var(--stm-card)',
                color: selectedCategory === cat ? 'var(--stm-primary)' : 'var(--stm-muted-foreground)',
                transition: 'all 0.14s',
                textTransform: 'capitalize',
              }}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dot" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
            <span className="stm-loader-capsule stm-loader-dash" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>Loading vendors...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius-lg)', color: 'var(--stm-error)', fontSize: '13px', fontFamily: 'var(--stm-font-body)' }}>
          {error}
        </div>
      )}

      {/* Vendor Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {vendors.map((vendor, idx) => {
            const avail = vendor.availability_status;
            const availStyle = avail ? AVAIL[avail] ?? AVAIL['Unavailable'] : null;
            const rating = vendor.avg_overall_rating ? Number(vendor.avg_overall_rating) : null;
            const quality = (vendor as any).avg_quality ? Number((vendor as any).avg_quality) : null;
            const comms = (vendor as any).avg_communication ? Number((vendor as any).avg_communication) : null;
            const recPct = (vendor as any).recommendation_pct ? Math.round(Number((vendor as any).recommendation_pct)) : null;
            const projects = vendor.total_projects ?? 0;

            return (
              <div
                key={vendor.vendor_id}
                onClick={() => { setSelectedVendor(vendor); setIsPanelOpen(true); }}
                style={{
                  backgroundColor: 'var(--stm-card)',
                  border: '1px solid var(--stm-border)',
                  borderRadius: 'var(--stm-radius-lg)',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 3,
                  animationDelay: `${idx * 0.03}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-primary)';
                  el.style.boxShadow = '0 6px 24px rgba(26,82,118,0.12)';
                  el.style.transform = 'translateY(-2px)';
                  const bar = el.querySelector('.vc-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'var(--stm-border)';
                  el.style.boxShadow = 'none';
                  el.style.transform = 'translateY(0)';
                  const bar = el.querySelector('.vc-accent-bar') as HTMLElement;
                  if (bar) bar.style.opacity = '0';
                }}
              >
                {/* Left accent bar on hover */}
                <div
                  className="vc-accent-bar"
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0, width: '3px',
                    background: 'linear-gradient(180deg, var(--stm-primary), var(--stm-accent))',
                    opacity: 0, transition: 'opacity 0.18s', borderRadius: '3px 0 0 3px',
                  }}
                />

                {/* Top: name/category + avatar */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--stm-foreground)', marginBottom: '2px', fontFamily: 'var(--stm-font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {vendor.vendor_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                      {formatCategory(vendor.service_categories, vendor.vendor_type)}
                    </div>
                  </div>
                  <MorseAvatar name={vendor.vendor_name} />
                </div>

                {/* Availability badge */}
                {availStyle && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 8px', borderRadius: '20px', marginBottom: '10px',
                    fontSize: '11px', fontWeight: '600', fontFamily: 'var(--stm-font-body)',
                    backgroundColor: availStyle.bg, color: availStyle.color,
                    border: `1px solid ${availStyle.border}`,
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: 'currentColor',
                      boxShadow: availStyle.pulse ? '0 0 5px currentColor' : 'none',
                      animation: availStyle.pulse ? 'pulse 2s infinite' : 'none',
                    }} />
                    {avail}
                  </div>
                )}

                {/* Score row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--stm-border)', marginTop: availStyle ? '0' : '10px' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: scoreColor(rating), lineHeight: 1, fontFamily: 'var(--stm-font-body)' }}>
                      {rating ? rating.toFixed(1) : '—'}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--stm-muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px', fontFamily: 'var(--stm-font-body)' }}>
                      Avg Rating
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {recPct != null && (
                      <div style={{ fontSize: '11px', color: 'var(--stm-success)', fontWeight: '600', fontFamily: 'var(--stm-font-body)' }}>
                        {recPct}% Recommend
                      </div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', marginTop: '2px' }}>
                      {projects} project{projects !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Stats: Quality + Comms */}
                {(quality != null || comms != null) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                    <div style={{ backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius)', padding: '8px 10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                        {quality ? quality.toFixed(1) : '—'}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--stm-muted-foreground)', marginTop: '1px', fontFamily: 'var(--stm-font-body)' }}>Quality</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--stm-muted)', borderRadius: 'var(--stm-radius)', padding: '8px 10px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--stm-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                        {comms ? comms.toFixed(1) : '—'}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--stm-muted-foreground)', marginTop: '1px', fontFamily: 'var(--stm-font-body)' }}>Comms</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && vendors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)', fontSize: '13px' }}>
          No vendors match your filters.
        </div>
      )}

      {selectedVendor && (
        <VendorPanel
          vendor={selectedVendor as Vendor}
          isOpen={isPanelOpen}
          onClose={() => { setIsPanelOpen(false); setSelectedVendor(null); }}
        />
      )}
    </div>
  );
}
