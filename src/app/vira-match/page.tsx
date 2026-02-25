// [R3.1] ViRA Match — Prototype layout: form panel left + results panel right
// [EPIC-002 M5] STM migration matching prototype spec
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Vendor } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sparkles, ExternalLink } from 'lucide-react';

interface MatchResult {
  vendorName: string;
  vendor_id?: string;
  viraScore: number;
  reason: string;
  keyStrengths: string[];
  considerations?: string;
  totalProjects?: number;
  category: string;
  availability_status?: string;
  pricingStructure?: string;
  rateCost?: string;
}

interface RemainingVendor {
  vendorName: string;
  vendor_id: string;
  category: string;
  preScore: number;
  totalProjects: number;
  avgRating: number | null;
  recommendationPct: number | null;
  pricingStructure: string | null;
  rateCost: string | null;
}

interface MatchResponse {
  matches?: MatchResult[];
  recommendations?: MatchResult[];
  remainingVendors?: RemainingVendor[];
  candidatesAnalyzed?: number;
  query_info?: { candidates_analyzed?: number; sent_to_ai?: number };
}

const RANK_COLORS = [
  { bg: 'var(--stm-primary)', light: 'color-mix(in srgb, var(--stm-primary) 10%, transparent)', border: 'var(--stm-primary)' },
  { bg: 'var(--stm-accent)',  light: 'color-mix(in srgb, var(--stm-accent) 10%, transparent)',  border: 'var(--stm-accent)' },
  { bg: 'var(--stm-secondary)', light: 'color-mix(in srgb, var(--stm-secondary) 10%, transparent)', border: 'var(--stm-secondary)' },
  { bg: 'var(--stm-muted-foreground)', light: 'var(--stm-muted)', border: 'var(--stm-muted-foreground)' },
  { bg: 'var(--stm-muted-foreground)', light: 'var(--stm-muted)', border: 'var(--stm-muted-foreground)' },
];

function scoreColor(score: number): string {
  if (score >= 85) return 'var(--stm-primary)';
  if (score >= 70) return 'var(--stm-accent)';
  if (score >= 55) return 'var(--stm-warning)';
  return 'var(--stm-muted-foreground)';
}

const AVAIL_STYLES: Record<string, React.CSSProperties> = {
  Available:   { backgroundColor: 'color-mix(in srgb, var(--stm-success) 8%, transparent)', color: 'var(--stm-success)', border: '1px solid color-mix(in srgb, var(--stm-success) 20%, transparent)' },
  Limited:     { backgroundColor: 'color-mix(in srgb, var(--stm-warning) 8%, transparent)', color: 'var(--stm-warning)', border: '1px solid color-mix(in srgb, var(--stm-warning) 20%, transparent)' },
  Unavailable: { backgroundColor: 'var(--stm-muted)', color: 'var(--stm-muted-foreground)', border: '1px solid var(--stm-border)' },
};

function formatCategory(cat: string | undefined | null): string {
  if (!cat) return '';
  const map: Record<string, string> = {
    content: 'Content Creation', data: 'Data Analysis', graphic_design: 'Graphic Design',
    paid_media: 'Paid Media', proofreading: 'Proofreading', seo: 'SEO',
    social_media: 'Social Media', webdev: 'Web Development',
  };
  return map[cat] || cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function ViRAMatchPage() {
  const router = useRouter();
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [remaining, setRemaining] = useState<RemainingVendor[]>([]);
  const [candidatesAnalyzed, setCandidatesAnalyzed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const { vendors }: { vendors: Vendor[] } = data;
        const cats = [...new Set(
          vendors.flatMap(v => {
            if (v.service_categories && Array.isArray(v.service_categories)) return v.service_categories.filter(Boolean);
            const legacy = v.service_category || v.vendor_type;
            return typeof legacy === 'string' ? legacy.split(',').map(c => c.trim()).filter(Boolean) : [];
          })
        )].sort() as string[];
        setServiceCategories(cats);
      })
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  const handleRun = async () => {
    if (!selectedCategory || !projectScope.trim()) return;
    setIsRunning(true);
    setError(null);
    setResults(null);
    setRemaining([]);
    try {
      const res = await fetch('/api/vira-match-semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceCategory: selectedCategory, projectScope }),
      });
      if (!res.ok) throw new Error('Failed to get recommendations. Please try again.');
      const data: MatchResponse = await res.json();
      const recs = data.matches ?? data.recommendations ?? [];
      setResults(recs);
      setRemaining(data.remainingVendors ?? []);
      setCandidatesAnalyzed(data.query_info?.candidates_analyzed ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsRunning(false);
    }
  };

  const canRun = selectedCategory && projectScope.trim().length >= 10 && !isRunning;

  const selectStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontFamily: 'var(--stm-font-body)',
    fontSize: '13px', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius)',
    backgroundColor: 'var(--stm-background)', color: 'var(--stm-foreground)',
    outline: 'none', transition: 'border-color 0.14s',
  };

  return (
    <ProtectedRoute>
      <div style={{ padding: 'var(--stm-space-8)', backgroundColor: 'var(--stm-page-background)', minHeight: '100%' }}>

        {/* Section Header */}
        <div style={{ marginBottom: 'var(--stm-space-5)' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1, letterSpacing: '-0.01em' }}>
            ViRA Match
          </div>
          <div style={{ fontSize: '12px', fontWeight: '400', color: 'var(--stm-muted-foreground)', marginTop: '4px' }}>
            AI-powered vendor recommendations based on project requirements
          </div>
        </div>

        {/* Match Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Form Panel */}
          <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', overflow: 'hidden', position: 'relative', zIndex: 3 }}>
            {/* Gradient Header */}
            <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', letterSpacing: '0.04em' }}>Match Parameters</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>Define your project to find the right vendor</div>
            </div>

            {/* Form Body */}
            <div style={{ padding: '18px' }}>
              {/* Service Category */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', marginBottom: '8px' }}>
                  Service Category
                </label>
                {categoriesLoading ? (
                  <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)' }}>Loading...</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {serviceCategories.map(cat => {
                      const active = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(active ? '' : cat)}
                          style={{
                            padding: '5px 11px',
                            borderRadius: 'var(--stm-radius-full)',
                            fontSize: '11px',
                            fontWeight: active ? '700' : '500',
                            border: active ? '1.5px solid var(--stm-primary)' : '1px solid var(--stm-border)',
                            backgroundColor: active ? 'var(--stm-primary)' : 'var(--stm-background)',
                            color: active ? 'white' : 'var(--stm-foreground)',
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                            fontFamily: 'var(--stm-font-body)',
                          }}
                        >
                          {formatCategory(cat)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Project Scope */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)' }}>
                    Project Scope
                  </label>
                  <span style={{ fontSize: '10px', color: projectScope.length < 10 ? 'var(--stm-warning)' : 'var(--stm-muted-foreground)', fontFamily: 'var(--stm-font-body)' }}>
                    {projectScope.length < 10 ? `${10 - projectScope.length} more chars needed` : `${projectScope.length} chars`}
                  </span>
                </div>
                <textarea
                  value={projectScope}
                  onChange={e => setProjectScope(e.target.value)}
                  placeholder="Describe the project goals, deliverables, and any specific requirements..."
                  rows={6}
                  style={{ ...selectStyle, resize: 'vertical', minHeight: '120px', lineHeight: 1.5 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--stm-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,82,118,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--stm-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', backgroundColor: 'color-mix(in srgb, var(--stm-error) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--stm-error) 20%, transparent)', borderRadius: 'var(--stm-radius)', fontSize: '12px', color: 'var(--stm-error)' }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleRun}
                disabled={!canRun}
                style={{
                  width: '100%', padding: '10px', fontFamily: 'var(--stm-font-body)',
                  fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em',
                  textTransform: 'uppercase', border: 'none', borderRadius: 'var(--stm-radius)',
                  background: canRun ? 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))' : 'var(--stm-muted)',
                  color: canRun ? 'white' : 'var(--stm-muted-foreground)',
                  cursor: canRun ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={e => { if (canRun) { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(26,82,118,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                {isRunning
                  ? <>Analyzing...</>
                  : <><Sparkles style={{ width: '13px', height: '13px' }} />Run ViRA Match</>
                }
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 3 }}>

            {/* Empty / Loading state */}
            {!results && !isRunning && (
              <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--stm-radius-full)', background: 'linear-gradient(135deg, var(--stm-primary), var(--stm-accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles style={{ width: '22px', height: '22px', color: 'white' }} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--stm-foreground)', margin: '0 0 6px' }}>Ready to Match</div>
                <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', margin: 0 }}>Select a category and describe your project to get AI-powered recommendations.</div>
              </div>
            )}

            {/* Loading — STM Morse Loader */}
            {isRunning && (
              <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: '64px 24px', textAlign: 'center', position: 'relative', zIndex: 3 }}>
                <div className="stm-loader stm-loader-lg" style={{ justifyContent: 'center', marginBottom: '24px' }}>
                  <span className="stm-loader-capsule stm-loader-dot" />
                  <span className="stm-loader-capsule stm-loader-dot" />
                  <span className="stm-loader-capsule stm-loader-dot" />
                  <span className="stm-loader-capsule stm-loader-dash" />
                  <span className="stm-loader-capsule stm-loader-dash" />
                  <span className="stm-loader-capsule stm-loader-dash" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--stm-foreground)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>ViRA is Analyzing Vendors</div>
                <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', margin: 0, lineHeight: 1.6 }}>
                  Scoring candidates against performance data<br />and generating AI insights...
                </div>
              </div>
            )}

            {/* Results */}
            {results && results.length > 0 && (
              <>
                {/* Results meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--stm-muted-foreground)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {results.length} Recommendation{results.length !== 1 ? 's' : ''} — {formatCategory(selectedCategory)}
                  </span>
                  {candidatesAnalyzed > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)' }}>{candidatesAnalyzed} vendors analyzed</span>
                  )}
                </div>

                {/* AI Result Cards */}
                {results.map((rec, i) => {
                  const rank = RANK_COLORS[i] ?? RANK_COLORS[3];
                  const sc = scoreColor(rec.viraScore);

                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'var(--stm-card)',
                        border: '1px solid var(--stm-border)',
                        borderLeft: `4px solid ${rank.bg}`,
                        borderRadius: 'var(--stm-radius-lg)',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.18s, transform 0.18s',
                        position: 'relative',
                        zIndex: 3,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(0,0,0,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      {/* Header row */}
                      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--stm-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          {/* Rank circle */}
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: rank.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: 'white', flexShrink: 0, letterSpacing: '-0.02em' }}>
                            {i + 1}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--stm-foreground)', lineHeight: 1.2 }}>
                                {rec.vendorName}
                              </div>
                              {rec.availability_status && AVAIL_STYLES[rec.availability_status] && (
                                <span style={{ ...AVAIL_STYLES[rec.availability_status], padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>
                                  {rec.availability_status}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{formatCategory(rec.category)}</span>
                              {rec.totalProjects ? <><span style={{ opacity: 0.4 }}>·</span><span>{rec.totalProjects} projects</span></> : null}
                              {rec.pricingStructure && rec.pricingStructure !== 'Not specified' ? <><span style={{ opacity: 0.4 }}>·</span><span>{rec.pricingStructure}</span></> : null}
                            </div>
                          </div>
                        </div>
                        {/* Score badge */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '34px', fontWeight: '800', color: sc, lineHeight: 1, letterSpacing: '-0.04em' }}>{rec.viraScore}</div>
                          <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', marginTop: '2px' }}>ViRA Score</div>
                        </div>
                      </div>

                      {/* Analysis body */}
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '12.5px', fontFamily: 'var(--stm-font-body)', color: 'var(--stm-foreground)', lineHeight: 1.7, marginBottom: '12px' }}>{rec.reason}</div>

                        {/* Strengths */}
                        {rec.keyStrengths?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: rec.considerations ? '10px' : '0' }}>
                            {rec.keyStrengths.map((tag, j) => (
                              <span key={j} style={{ fontSize: '10px', fontWeight: '600', padding: '3px 9px', borderRadius: '10px', backgroundColor: rank.light, color: rank.bg, border: `1px solid ${rank.border}` }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Considerations */}
                        {rec.considerations && rec.considerations !== 'None' && (
                          <div style={{ marginTop: '10px', padding: '8px 10px', backgroundColor: 'color-mix(in srgb, var(--stm-warning) 7%, transparent)', borderLeft: '3px solid var(--stm-warning)', borderRadius: '0 var(--stm-radius) var(--stm-radius) 0' }}>
                            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--stm-warning)' }}>Consider: </span>
                            <span style={{ fontSize: '11px', color: 'var(--stm-foreground)', opacity: 0.75 }}>{rec.considerations}</span>
                          </div>
                        )}

                        {/* View Profile */}
                        {rec.vendor_id && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--stm-border)' }}>
                            <button
                              onClick={() => router.push(`/vendors/${rec.vendor_id}`)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: 'var(--stm-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--stm-font-body)' }}
                            >
                              <ExternalLink style={{ width: '11px', height: '11px' }} />
                              View full profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Remaining vendors — not AI analyzed */}
            {results && remaining.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ marginBottom: '8px', paddingLeft: '2px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)' }}>
                    Also in this category — {remaining.length} more vendor{remaining.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '2px', opacity: 0.7 }}>
                    Matched by category but not included in the AI analysis. Scored by performance data only.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {remaining.map((v, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderLeft: '4px solid var(--stm-muted-foreground)', borderRadius: 'var(--stm-radius-lg)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', position: 'relative', zIndex: 3 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--stm-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.vendorName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--stm-muted-foreground)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          {v.totalProjects > 0 && <span>{v.totalProjects} projects</span>}
                          {v.avgRating != null && <span>{v.avgRating.toFixed(1)}/10 avg</span>}
                          {v.recommendationPct != null && <span>{v.recommendationPct.toFixed(0)}% recommend</span>}
                          {v.rateCost && <span>{v.rateCost}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--stm-muted-foreground)', lineHeight: 1, letterSpacing: '-0.03em' }}>{v.preScore}</div>
                        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--stm-muted-foreground)', opacity: 0.6 }}>Base Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {results && results.length === 0 && (
              <div style={{ backgroundColor: 'var(--stm-card)', border: '1px solid var(--stm-border)', borderRadius: 'var(--stm-radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--stm-foreground)', margin: '0 0 6px' }}>No Matches Found</div>
                <div style={{ fontSize: '12px', color: 'var(--stm-muted-foreground)', margin: 0 }}>Try a different category or expand your project description.</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
