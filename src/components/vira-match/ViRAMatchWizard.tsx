"use client"

import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Target,
  FileText,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Code,
  Search,
  Megaphone,
  BarChart3
} from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'

interface FormInputs {
  serviceCategory: string
  projectScope: string
}

interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface ViRAMatchWizardProps {
  serviceCategories: string[]
  categoriesLoading: boolean
}

export default function ViRAMatchWizard({ serviceCategories, categoriesLoading }: ViRAMatchWizardProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormInputs>()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const router = useRouter()

  const watchedCategory = watch('serviceCategory')
  const watchedScope = watch('projectScope')

  // Enhanced service categories with visual elements
  const enhancedCategories: ServiceCategory[] = serviceCategories.map((category, index) => ({
    id: category,
    name: formatCategoryForDisplay(category),
    description: getCategoryDescription(category),
    icon: getCategoryIcon(category, index),
    color: getCategoryColor(index),
    bgColor: getCategoryBgColor(index)
  }))

  function getCategoryDescription(category: string): string {
    // [R1] Updated to match the ACTUAL database categories (with underscores)
    const descriptions: Record<string, string> = {
      'content': 'Content writing, copywriting, and content strategy services',
      'data': 'Business intelligence, analytics, and data-driven insights',
      'graphic_design': 'Branding, visual identity, and creative design solutions',
      'paid_media': 'PPC advertising, social media ads, and paid marketing campaigns',
      'proofreading': 'Content editing, proofreading, and quality assurance services',
      'seo': 'Search engine optimization and organic traffic growth strategies',
      'social_media': 'Social media management, content, and community engagement',
      'webdev': 'Custom websites, web applications, and digital development'
    }
    return descriptions[category] || 'Professional services and solutions'
  }

  // [R1] Format categories for display while preserving database values
  function formatCategoryForDisplay(category: string): string {
    const formatted: Record<string, string> = {
      'content': 'Content Creation',
      'data': 'Data Analysis',
      'graphic_design': 'Graphic Design',
      'paid_media': 'Paid Media',
      'proofreading': 'Proofreading',
      'seo': 'SEO',
      'social_media': 'Social Media',
      'webdev': 'Web Development'
    }
    return formatted[category] || category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  function getCategoryIcon(category: string, index: number) {
    // [R1] Assign specific icons to each category for better user experience
    const categoryIcons: Record<string, React.ReactNode> = {
      'content': <FileText key="content" className="w-6 h-6" />,
      'data': <BarChart3 key="data" className="w-6 h-6" />,
      'graphic_design': <Sparkles key="graphic_design" className="w-6 h-6" />,
      'paid_media': <Megaphone key="paid_media" className="w-6 h-6" />,
      'proofreading': <CheckCircle key="proofreading" className="w-6 h-6" />,
      'seo': <Search key="seo" className="w-6 h-6" />,
      'social_media': <Users key="social_media" className="w-6 h-6" />,
      'webdev': <Code key="webdev" className="w-6 h-6" />
    }

    // Return specific icon or fallback to generic Award icon
    return categoryIcons[category] || <Award key={`fallback-${index}`} className="w-6 h-6" />
  }

  function getCategoryColor(index: number): string {
    const colors = [
      'text-blue-600', 'text-purple-600', 'text-green-600', 'text-orange-600',
      'text-pink-600', 'text-indigo-600', 'text-red-600'
    ]
    return colors[index % colors.length]
  }

  function getCategoryBgColor(index: number): string {
    const bgColors = [
      'bg-blue-50 hover:bg-blue-100 border-blue-200',
      'bg-purple-50 hover:bg-purple-100 border-purple-200',
      'bg-green-50 hover:bg-green-100 border-green-200',
      'bg-orange-50 hover:bg-orange-100 border-orange-200',
      'bg-pink-50 hover:bg-pink-100 border-pink-200',
      'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
      'bg-red-50 hover:bg-red-100 border-red-200'
    ]
    return bgColors[index % bgColors.length]
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setValue('serviceCategory', categoryId)
    setTimeout(() => setCurrentStep(2), 300)
  }

  const handleNext = () => {
    if (currentStep === 1 && watchedCategory) {
      setCurrentStep(2)
    } else if (currentStep === 2 && watchedScope?.trim()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use new semantic search API
      const response = await fetch('/api/vira-match-semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectDescription: data.projectScope,
          serviceCategory: data.serviceCategory,
          projectScope: data.projectScope
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendations. Please try again.')
      }

      const result = await response.json()

      const params = new URLSearchParams()
      params.set('data', JSON.stringify(result))
      params.set('semantic', 'true') // Flag for semantic search results
      router.push(`/recommendations?${params.toString()}`)

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Vendor</h1>
          <Badge variant="outline" className="px-3 py-1">
            Step {currentStep} of 3
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{ backgroundColor: '#1A5276', width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'font-medium' : ''} style={{ color: currentStep >= 1 ? '#1A5276' : '' }}>Choose Category</span>
            <span className={currentStep >= 2 ? 'font-medium' : ''} style={{ color: currentStep >= 2 ? '#1A5276' : '' }}>Describe Project</span>
            <span className={currentStep >= 3 ? 'font-medium' : ''} style={{ color: currentStep >= 3 ? '#1A5276' : '' }}>Get Matches</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Category Selection */}
        {currentStep === 1 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1A5276' }}>
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Service Category</h2>
              <p className="text-gray-600">Select the type of service that best fits your project needs</p>
            </div>

            {categoriesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enhancedCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${category.bgColor}
                      hover:scale-105 hover:shadow-md`}
                    style={selectedCategory === category.id ? {
                      borderColor: '#1A5276',
                      boxShadow: `0 0 0 2px rgba(26, 82, 118, 0.2)`
                    } : {}}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`mb-3 ${category.color}`}>
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      {selectedCategory === category.id && (
                        <CheckCircle className="w-5 h-5 mt-2" style={{ color: '#1A5276' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              type="hidden"
              {...register('serviceCategory', { required: 'Please select a service category.' })}
            />
            {errors.serviceCategory && (
              <p className="mt-4 text-sm text-red-600 text-center">
                {errors.serviceCategory.message}
              </p>
            )}
          </Card>
        )}

        {/* Step 2: Project Description */}
        {currentStep === 2 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#6B8F71' }}>
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Project</h2>
              <p className="text-gray-600">The more detail you provide, the better we can match you with the right vendors</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <textarea
                {...register('projectScope', { required: 'Please describe your project.' })}
                className="w-full h-40 p-4 border border-gray-300 rounded-lg transition-colors"
                onFocus={(e) => {
                  e.target.style.borderColor = '#1A5276'
                  e.target.style.boxShadow = `0 0 0 2px rgba(26, 82, 118, 0.2)`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Describe your project in detail... Include goals, requirements, timeline, special considerations, and any specific expertise needed."
              />
              {errors.projectScope && (
                <p className="mt-2 text-sm text-red-600">{errors.projectScope.message}</p>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a great description:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Include your main goals and objectives</li>
                  <li>• Mention any specific technologies or approaches</li>
                  <li>• Share your timeline and budget considerations</li>
                  <li>• Note any special requirements or constraints</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!watchedScope?.trim()}
                className="flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card className="p-8">
            {isLoading ? (
              /* Enhanced Loading Screen */
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ backgroundColor: '#1A5276' }}>
                    <Sparkles className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is Finding Your Perfect Matches</h2>
                  <p className="text-gray-600">This may take 20-30 seconds as we analyze thousands of data points</p>
                </div>

                {/* Progress Animation */}
                <div className="max-w-2xl mx-auto mb-8">
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                      <div className="h-3 rounded-full animate-pulse" style={{ width: '75%', backgroundColor: '#1A5276' }}></div>
                    </div>
                  </div>

                  {/* Processing Steps */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-blue-900">Filtering Vendor Candidates</h4>
                        <p className="text-sm text-blue-700">Analyzing {watchedCategory} specialists in our database...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-purple-900">Analyzing Performance Data</h4>
                        <p className="text-sm text-purple-700">Evaluating ratings, project history, and client satisfaction...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-pink-900">Generating Intelligent Recommendations</h4>
                        <p className="text-sm text-pink-700">Creating your personalized ViRA scores and insights...</p>
                      </div>
                    </div>
                  </div>

                  {/* Fun Loading Messages */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="animate-pulse">Crunching the numbers to find your ideal vendor partners...</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Step 3 Content */
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1A5276' }}>
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Find Your Match?</h2>
                  <p className="text-gray-600">Our AI will analyze your requirements and recommend the best vendors</p>
                </div>

                {/* Review Section */}
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Category:</h4>
                    <Badge className="bg-blue-100 text-blue-800">{watchedCategory}</Badge>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Project Description:</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {watchedScope?.substring(0, 200)}
                      {watchedScope && watchedScope.length > 200 && '...'}
                    </p>
                  </div>

                  {/* What Happens Next */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      What happens next:
                    </h4>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span>Our AI analyzes your requirements against our vendor database</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <span>We evaluate performance history, client ratings, and specialties</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                        <span>You receive ranked recommendations with detailed insights</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 text-white"
                      style={{ backgroundColor: '#1A5276' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#154466'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1A5276'
                      }}
                    >
                      Get AI Recommendations
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}
      </form>
    </div>
  )
}
