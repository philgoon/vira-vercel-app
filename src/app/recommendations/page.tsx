'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, TrendingUp, CheckCircle, AlertCircle, ArrowLeft, Trophy, Sparkles, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { EnhancedRecommendation, LegacyRecommendation } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// [R1] Group recommendations by vendor category for expandable display
interface CategoryGroup {
  category: string
  vendors: (EnhancedRecommendation | LegacyRecommendation)[]
}

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const isSemantic = searchParams.get('semantic') === 'true'
  const isEnhanced = searchParams.get('enhanced') === 'true'

  // [R1] State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [recommendations, setRecommendations] = useState<(EnhancedRecommendation | LegacyRecommendation)[]>([])

  // Load recommendations from sessionStorage or URL params after component mounts
  useEffect(() => {
    let data = null
    
    // Try sessionStorage first (for semantic search results)
    const storedData = sessionStorage.getItem('vira-match-results')
    if (storedData) {
      data = storedData
      // Clear after reading to prevent stale data
      sessionStorage.removeItem('vira-match-results')
      sessionStorage.removeItem('vira-match-timestamp')
    } else {
      // Fall back to URL params for backwards compatibility
      data = searchParams.get('data')
    }

    if (data) {
      try {
        const parsedData = JSON.parse(data)
        // Handle semantic search response structure (has matches array)
        if (parsedData.matches && Array.isArray(parsedData.matches)) {
          setRecommendations(parsedData.matches)
        } else if (Array.isArray(parsedData)) {
          // Handle legacy array response
          setRecommendations(parsedData)
        } else {
          console.error('Unexpected data structure:', parsedData)
        }
      } catch (error) {
        console.error('Failed to parse recommendations data:', error)
      }
    }
  }, [searchParams])

  // [R1] CRITICAL: Move isEnhancedRecommendation function BEFORE it's used
  const isEnhancedRecommendation = (rec: EnhancedRecommendation | LegacyRecommendation): rec is EnhancedRecommendation => {
    return 'viraScore' in rec
  }

  // [R1] Group recommendations by category for organized display
  const groupedRecommendations: CategoryGroup[] = recommendations.reduce((acc: CategoryGroup[], rec) => {
    // Extract category from semantic search results or legacy results
    const category = (rec as any).service_categories?.[0] || 
                     (rec as any).vendorType || 
                     'All Vendors'

    let categoryGroup = acc.find(group => group.category === category)

    if (!categoryGroup) {
      categoryGroup = { category, vendors: [] }
      acc.push(categoryGroup)
    }

    categoryGroup.vendors.push(rec)
    return acc
  }, [])

  // [R1] Sort vendors within each category by ViRA score (highest first)
  groupedRecommendations.forEach(group => {
    group.vendors.sort((a, b) => {
      const aScore = (a as any).viraScore || (a as any).match_confidence || 0
      const bScore = (b as any).viraScore || (b as any).match_confidence || 0
      return bScore - aScore
    })
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#1A5276' // Brand blue for top scores
    if (score >= 80) return '#6B8F71' // Brand green for good scores
    if (score >= 70) return '#6E6F71' // Brand gray for decent scores
    return '#dc2626' // Red for low scores
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-white" />
    if (index === 1) return <Award className="w-6 h-6 text-white" />
    if (index === 2) return <Star className="w-6 h-6 text-white" />
    return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">{index + 1}</div>
  }

  const getRankLabel = (index: number) => {
    if (index === 0) return 'Top Choice'
    if (index === 1) return 'Strong Alternative'
    if (index === 2) return 'Good Option'
    return `Option ${index + 1}`
  }

  // Truncate verbose analysis to 2-3 sentences max
  const truncateAnalysis = (text: string | undefined): string => {
    if (!text) return 'No analysis available'
    const sentences = text.split('. ')
    if (sentences.length <= 2) return text
    return sentences.slice(0, 2).join('. ') + '.'
  }

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'content': 'Content Creation',
      'copywriting': 'Copywriting',
      'data': 'Data Analysis',
      'graphic_design': 'Graphic Design',
      'paid_media': 'Paid Media',
      'proofreading': 'Proofreading',
      'seo': 'SEO',
      'social_media': 'Social Media',
      'webdev': 'Web Development'
    }
    return categoryMap[category] || category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // [R1] Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // [R1] Get vendors to display (top 3 or all if expanded)
  const getVendorsToShow = (categoryGroup: CategoryGroup) => {
    const isExpanded = expandedCategories.has(categoryGroup.category)
    return isExpanded ? categoryGroup.vendors : categoryGroup.vendors.slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A5276' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your ViRA Recommendations</h1>
                <p className="text-gray-600">AI-powered vendor matches organized by category</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/vira-match">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  New Search
                </Button>
              </Link>
              <Link href="/">
                <Button style={{ backgroundColor: '#1A5276' }} className="text-white hover:opacity-90">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Found {recommendations.length} vendor matches for {searchParams.get('category') || 'your search'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {groupedRecommendations.length > 0 ? (
          <div className="space-y-8">
            {groupedRecommendations.map((categoryGroup) => {
              const vendorsToShow = getVendorsToShow(categoryGroup)
              const hasMoreVendors = categoryGroup.vendors.length > 3
              const isExpanded = expandedCategories.has(categoryGroup.category)

              return (
                <div key={categoryGroup.category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{formatCategoryName(categoryGroup.category)}</h2>
                      <p className="text-gray-600">
                        {categoryGroup.vendors.length} vendor{categoryGroup.vendors.length !== 1 ? 's' : ''} available
                      </p>
                    </div>

                    {/* Show More/Less Button */}
                    {hasMoreVendors && (
                      <Button
                        variant="outline"
                        onClick={() => toggleCategory(categoryGroup.category)}
                        className="flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            See More Vendors ({categoryGroup.vendors.length - 3} more)
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Vendors in this category */}
                  <div className="space-y-6">
                    {vendorsToShow.map((rec, index) => {
                      const isEnhanced = isEnhancedRecommendation(rec)
                      const globalIndex = categoryGroup.vendors.indexOf(rec)

                      return (
                        <Card key={`${categoryGroup.category}-${index}`} className="overflow-hidden">
                          {/* Ranking Header */}
                          <div className="h-20 relative" style={{ backgroundColor: getScoreColor((rec as any).viraScore || (rec as any).match_confidence || 0) }}>
                            <div className="flex items-center justify-between h-full px-6 text-white">
                              <div className="flex items-center gap-4">
                                {getRankIcon(globalIndex)}
                                <div>
                                  <h2 className="text-xl font-bold">{(rec as any).vendor_name || (rec as any).vendorName}</h2>
                                  <p className="text-sm opacity-90">{getRankLabel(globalIndex)}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-3xl font-bold">{(rec as any).viraScore || (rec as any).match_confidence || 0}</div>
                                <div className="text-sm opacity-90">ViRA Score</div>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            {/* Key Strengths */}
                            {isEnhanced && rec.keyStrengths && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4" />
                                  Key Strengths
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {rec.keyStrengths.map((strength, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700">
                                      {strength}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pricing Information */}
                            <div style={{
                              padding: '1rem',
                              backgroundColor: '#f0f9ff',
                              borderRadius: '0.375rem',
                              border: '1px solid #0ea5e9',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#0c4a6e' }}>💰 Pricing</span>
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                                <div><strong>Structure:</strong> {rec.pricingStructure || 'Not specified'}</div>
                                <div><strong>Rate:</strong> {rec.rateCost || 'Contact for pricing'}</div>
                              </div>
                            </div>

                            {/* [R4] Experience section - compact format */}
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">📊 Experience</h4>
                              <div className="space-y-1">
                                {/* Total Projects */}
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">Total Projects:</span> {rec.totalProjects || 0} completed
                                </div>

                                {/* Client Names - deduplicated comma-separated list */}
                                {rec.clientNames && rec.clientNames.length > 0 && (
                                  <div className="text-sm text-gray-700">
                                    <span className="font-medium">Clients:</span> {Array.from(new Set(rec.clientNames)).join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Concise Analysis */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                {isEnhanced ? 'ViRA Analysis' : 'Why This Vendor'}
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {truncateAnalysis((rec as any).match_reasoning || (rec as any).reason)}
                              </p>
                            </div>

                            {/* Considerations */}
                            {isEnhanced && rec.considerations && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Considerations
                                </h4>
                                <p className="text-gray-600 text-sm italic">
                                  {rec.considerations}
                                </p>
                              </div>
                            )}

                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Enhancement Notice */}
            {isEnhanced && (
              <Card className="p-6 border-2" style={{ backgroundColor: '#f8fafc', borderColor: '#1A5276' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A5276' }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Enhanced by ViRA Intelligence</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      These recommendations are powered by real performance data, client ratings, and AI analysis.
                      ViRA Scores consider service fit, project alignment, and satisfaction metrics for data-driven vendor selection.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find any matching vendors for your criteria. Please try adjusting your search.
            </p>
            <Link href="/vira-match">
              <Button style={{ backgroundColor: '#1A5276' }} className="text-white hover:opacity-90">
                Try New Search
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#1A5276' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your ViRA Recommendations</h1>
                <p className="text-gray-600">Loading your perfect vendor matches...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1A5276', borderTopColor: 'transparent' }}></div>
          </div>
        </div>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  )
}
