'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Star, TrendingUp, CheckCircle, AlertCircle, ArrowLeft, Trophy, Sparkles, Award } from 'lucide-react'
import { EnhancedRecommendation, LegacyRecommendation } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const data = searchParams.get('data')
  const isEnhanced = searchParams.get('enhanced') === 'true'

  let recommendations: (EnhancedRecommendation | LegacyRecommendation)[] = []

  if (data) {
    try {
      recommendations = JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse recommendations data:', error)
    }
  }

  const isEnhancedRecommendation = (rec: EnhancedRecommendation | LegacyRecommendation): rec is EnhancedRecommendation => {
    return 'viraScore' in rec
  }

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
  const truncateAnalysis = (text: string): string => {
    const sentences = text.split('. ')
    if (sentences.length <= 2) return text
    return sentences.slice(0, 2).join('. ') + '.'
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
                <p className="text-gray-600">AI-powered vendor matches ranked by compatibility</p>
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
                Found {recommendations.length} perfect matches - ranked by ViRA Score
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const isEnhanced = isEnhancedRecommendation(rec)

              return (
                <Card key={index} className="overflow-hidden">
                  {/* Ranking Header */}
                  <div className="h-20 relative" style={{ backgroundColor: isEnhanced ? getScoreColor(rec.viraScore) : '#6E6F71' }}>
                    <div className="flex items-center justify-between h-full px-6 text-white">
                      <div className="flex items-center gap-4">
                        {getRankIcon(index)}
                        <div>
                          <h2 className="text-xl font-bold">{rec.vendorName}</h2>
                          <p className="text-sm opacity-90">{getRankLabel(index)}</p>
                        </div>
                      </div>

                      {isEnhanced && (
                        <div className="text-right">
                          <div className="text-3xl font-bold">{rec.viraScore}</div>
                          <div className="text-sm opacity-90">ViRA Score</div>
                        </div>
                      )}
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

                    {/* Concise Analysis */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {isEnhanced ? 'ViRA Analysis' : 'Why This Vendor'}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {truncateAnalysis(rec.reason)}
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
