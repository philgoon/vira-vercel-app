// [R7.1] Enhanced recommendations page with ViRA Scores and detailed vendor analysis
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, TrendingUp, CheckCircle, AlertCircle, ArrowLeft, Mail, Trophy } from 'lucide-react';
import { EnhancedRecommendation, LegacyRecommendation } from '@/types';

export default function RecommendationsPage() {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');
  const isEnhanced = searchParams.get('enhanced') === 'true';
  
  let recommendations: (EnhancedRecommendation | LegacyRecommendation)[] = [];

  // [R7.1] Parse recommendations from URL query parameters
  if (data) {
    try {
      recommendations = JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse recommendations data:', error);
    }
  }

  // [R7.2] Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
    if (score >= 7.0) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
    if (score >= 5.5) return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
    return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
  };

  // [R7.2] Helper function to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent Match';
    if (score >= 7.0) return 'Great Match';
    if (score >= 5.5) return 'Good Match';
    return 'Consider Carefully';
  };

  // [R7.3] Helper function to check if recommendation is enhanced
  const isEnhancedRecommendation = (rec: EnhancedRecommendation | LegacyRecommendation): rec is EnhancedRecommendation => {
    return 'viraScore' in rec;
  };

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h1 style={{
                  fontSize: '1.875rem',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 'bold',
                  color: '#1A5276'
                }}>
                  {isEnhanced ? 'ViRA Enhanced Recommendations' : 'Vendor Recommendations'}
                </h1>
                {isEnhanced && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    <Trophy style={{ width: '0.875rem', height: '0.875rem' }} />
                    AI-Powered Analysis
                  </div>
                )}
              </div>
              <p style={{ color: '#6b7280' }}>
                {isEnhanced 
                  ? 'Data-driven vendor recommendations powered by performance analytics and AI scoring'
                  : 'AI-generated vendor matches for your project'
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href="/vira-match"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                New Search
              </Link>
              <Link
                href="/"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          
          {recommendations.length > 0 ? (
            <>
              {/* Results Summary */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#15803d' }} />
                <div>
                  <p style={{ color: '#15803d', fontWeight: '600', marginBottom: '0.25rem' }}>
                    Found {recommendations.length} {isEnhanced ? 'Enhanced' : 'AI'} Recommendations
                  </p>
                  <p style={{ color: '#166534', fontSize: '0.875rem' }}>
                    {isEnhanced 
                      ? 'Each vendor has been analyzed using performance data, client ratings, and project fit scoring'
                      : 'Recommendations generated based on your project requirements'
                    }
                  </p>
                </div>
              </div>

              {/* Recommendations Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {recommendations.map((rec, index) => {
                  const isEnhanced = isEnhancedRecommendation(rec);
                  const scoreColors = isEnhanced ? getScoreColor(rec.viraScore) : null;
                  
                  return (
                    <div key={index} className="professional-card" style={{ overflow: 'hidden' }}>
                      {/* Vendor Header */}
                      <div style={{
                        height: isEnhanced ? '6rem' : '4rem',
                        background: `linear-gradient(135deg, #1A5276 0%, #6B8F71 100%)`,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem'
                      }}>
                        <div style={{ color: 'white' }}>
                          <h3 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600', 
                            marginBottom: '0.25rem',
                            lineHeight: '1.3'
                          }}>
                            {rec.vendorName}
                          </h3>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            opacity: 0.9
                          }}>
                            <span>#{index + 1} Recommendation</span>
                            {isEnhanced && (
                              <>
                                <span>•</span>
                                <span>{getScoreLabel(rec.viraScore)}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isEnhanced && scoreColors && (
                          <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '0.5rem',
                            padding: '0.75rem',
                            textAlign: 'center',
                            minWidth: '5rem'
                          }}>
                            <div style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold', 
                              color: 'white',
                              marginBottom: '0.25rem'
                            }}>
                              {rec.viraScore.toFixed(1)}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontWeight: '500'
                            }}>
                              ViRA Score
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vendor Content */}
                      <div style={{ padding: '1.5rem' }}>
                        
                        {/* Key Strengths (Enhanced only) */}
                        {isEnhanced && rec.keyStrengths && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: '600', 
                              color: '#111827', 
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <TrendingUp style={{ width: '0.875rem', height: '0.875rem' }} />
                              Key Strengths
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {rec.keyStrengths.map((strength, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#E8F4F8',
                                    color: '#1A5276',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500'
                                  }}
                                >
                                  {strength}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Analysis/Reason */}
                        <div style={{ marginBottom: '1rem' }}>
                          <h4 style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#111827', 
                            marginBottom: '0.5rem' 
                          }}>
                            {isEnhanced ? 'ViRA Analysis' : 'Why This Vendor'}
                          </h4>
                          <p style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            lineHeight: '1.5'
                          }}>
                            {rec.reason}
                          </p>
                        </div>

                        {/* Considerations (Enhanced only) */}
                        {isEnhanced && rec.considerations && (
                          <div style={{ marginBottom: '1rem' }}>
                            <h4 style={{ 
                              fontSize: '0.875rem', 
                              fontWeight: '600', 
                              color: '#111827', 
                              marginBottom: '0.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <AlertCircle style={{ width: '0.875rem', height: '0.875rem' }} />
                              Considerations
                            </h4>
                            <p style={{ 
                              color: '#6b7280', 
                              fontSize: '0.875rem', 
                              lineHeight: '1.4',
                              fontStyle: 'italic'
                            }}>
                              {rec.considerations}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                          <button style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: '#1A5276',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 150ms'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#154466';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A5276';
                          }}
                          >
                            <Mail style={{ width: '1rem', height: '1rem' }} />
                            Contact Vendor
                          </button>
                          
                          <button style={{
                            padding: '0.75rem',
                            backgroundColor: '#6B8F71',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 150ms'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a7660';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6B8F71';
                          }}
                          >
                            <Star style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhancement Notice */}
              {isEnhanced && (
                <div className="professional-card" style={{ 
                  marginTop: '2rem', 
                  padding: '1.5rem',
                  backgroundColor: '#fef9c3',
                  border: '1px solid #fde047'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                    <Trophy style={{ width: '1.5rem', height: '1.5rem', color: '#ca8a04', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <h3 style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
                        Enhanced by ViRA Intelligence
                      </h3>
                      <p style={{ color: '#a16207', fontSize: '0.875rem', lineHeight: '1.5' }}>
                        These recommendations are powered by real client ratings, project performance data, and AI analysis. 
                        ViRA Scores consider service category fit, project scope alignment, historical performance, 
                        and client satisfaction metrics to provide data-driven vendor recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // [R7.4] No recommendations found
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <AlertCircle style={{ width: '2rem', height: '2rem', color: '#9ca3af' }} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                No Recommendations Found
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                We couldn't find any matching vendors for your criteria. Please try adjusting your search.
              </p>
              <Link
                href="/vira-match"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1A5276',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500'
                }}
              >
                Try New Search
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
