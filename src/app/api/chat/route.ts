// [R6.1] ViRA Chat API - Conversational AI interface with vendor intelligence
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { genAI } from '@/lib/ai';
import { ChatMessage, VendorSearchResult, MessageIntent } from '@/types';

// [R6.10] Interface for recommendation response
interface RecommendationData {
  vendorName: string;
  viraScore: number;
  reason: string;
  keyStrengths: string[];
  considerations?: string;
}

// [R6.3] In-memory conversation storage (session-based)
// Note: For production, this could be moved to database for persistence
const conversationHistory = new Map<string, ChatMessage[]>();

export async function POST(request: Request) {
  try {
    console.log('=== ViRA Chat API Called ===');
    
    // [R6.1] Parse chat request
    const body = await request.json();
    console.log('Chat request:', body);
    
    const { message, sessionId = 'default', conversationHistory: clientHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' }, 
        { status: 400 }
      );
    }

    // [R6.3] Get or initialize conversation history
    let history = conversationHistory.get(sessionId) || [];
    
    // Use client-provided history if available (for session continuity)
    if (clientHistory && Array.isArray(clientHistory)) {
      history = clientHistory;
    }

    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    history.push(userMessage);

    // [R6.4] Analyze message intent to determine response strategy
    const intent = await analyzeMessageIntent(message);
    console.log('Message intent:', intent);

    let response: string;
    let vendorData: VendorSearchResult[] | null = null;

    if (intent.type === 'vendor_recommendation') {
      // [R6.5] Handle vendor recommendation requests using existing enhanced API
      response = await handleVendorRecommendation(message, intent);
    } else if (intent.type === 'vendor_search') {
      // [R6.6] Handle direct vendor database searches
      const searchResults = await searchVendorDatabase(intent.searchTerm || message);
      response = await formatVendorSearchResults(searchResults, message);
      vendorData = searchResults;
    } else {
      // [R6.7] Handle general conversation with context
      response = await handleGeneralConversation(message, history);
    }

    // [R6.3] Add assistant response to history
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    history.push(assistantMessage);

    // Store updated history
    conversationHistory.set(sessionId, history);

    // [R6.8] Return structured response
    return NextResponse.json({
      message: response,
      sessionId,
      intent: intent.type,
      vendorData,
      conversationHistory: history.slice(-10), // Return last 10 messages for context
      timestamp: new Date()
    });

  } catch (error) {
    console.error('ViRA Chat API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your message.' },
      { status: 500 }
    );
  }
}

// [R6.4] Analyze user message to determine intent and extract key information
async function analyzeMessageIntent(message: string): Promise<MessageIntent> {
  const lowerMessage = message.toLowerCase();

  // [R6.4] Enhanced vendor recommendation patterns
  const recommendationKeywords = [
    'recommend', 'suggestion', 'find vendors', 'best vendor', 'who should i',
    'vendors for', 'need a vendor', 'looking for', 'project', 'help with',
    'what vendors', 'which vendor', 'i need', 'need help', 'vendors do you recommend',
    'who do you recommend', 'can you recommend', 'suggest', 'find me',
    'for my project', 'for this project', 'best option', 'good vendor'
  ];

  const hasRecommendationIntent = recommendationKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // [R6.4] Enhanced direct search patterns  
  const searchKeywords = [
    'show me', 'list', 'vendors in', 'who are', 'tell me about',
    'vendors that', 'vendors with', 'find all', 'display', 'see all',
    'all vendors', 'available vendors'
  ];

  const hasSearchIntent = searchKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );

  // [R6.4] Extract service categories with more variations
  const serviceCategories = [
    'web development', 'mobile app', 'data analytics', 'content', 'design',
    'marketing', 'seo', 'ecommerce', 'e-commerce', 'crm', 'consulting',
    'writing', 'content writing', 'automotive content', 'copywriting',
    'development', 'app development', 'website', 'graphic design'
  ];

  const detectedCategory = serviceCategories.find(category => 
    lowerMessage.includes(category)
  );

  // [R6.4] Enhanced logic: Prioritize recommendation over search when both are present
  if (hasRecommendationIntent || (detectedCategory && !hasSearchIntent)) {
    // If we detect recommendation intent OR have a service category without explicit search intent
    return {
      type: 'vendor_recommendation',
      serviceCategory: detectedCategory || extractImpliedCategory(message),
      projectScope: message
    };
  }

  if (hasSearchIntent || detectedCategory) {
    return {
      type: 'vendor_search',
      searchTerm: detectedCategory || extractSearchTerms(message)
    };
  }

  return { type: 'general' };
}

// [R6.4] Extract implied service category from message context
function extractImpliedCategory(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Context-based category detection
  if (lowerMessage.includes('writer') || lowerMessage.includes('writing') || lowerMessage.includes('content')) {
    return 'content';
  }
  if (lowerMessage.includes('website') || lowerMessage.includes('web') || lowerMessage.includes('development')) {
    return 'web development';
  }
  if (lowerMessage.includes('app') || lowerMessage.includes('mobile')) {
    return 'mobile app';
  }
  if (lowerMessage.includes('data') || lowerMessage.includes('analytics')) {
    return 'data analytics';
  }
  if (lowerMessage.includes('design') || lowerMessage.includes('graphic')) {
    return 'design';
  }
  if (lowerMessage.includes('marketing') || lowerMessage.includes('seo')) {
    return 'marketing';
  }
  
  // Default fallback
  return 'consulting';
}

// [R6.4] Extract search terms from message
function extractSearchTerms(message: string): string {
  // Simple extraction - look for quoted terms or capitalize words
  const quotedTerms = message.match(/"([^"]+)"/g);
  if (quotedTerms) {
    return quotedTerms[0].replace(/"/g, '');
  }

  // Extract capitalized words as potential vendor names or specialties
  const capitalizedWords = message.match(/\b[A-Z][a-z]+\b/g);
  if (capitalizedWords && capitalizedWords.length > 0) {
    return capitalizedWords.join(' ');
  }

  return message;
}

// [R6.5] Handle vendor recommendation using existing enhanced API
async function handleVendorRecommendation(message: string, intent: MessageIntent): Promise<string> {
  try {
    // [R6.5] Construct proper URL for internal API call
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000');
    
    const apiUrl = `${baseUrl}/api/vira-match-enhanced`;
    console.log('Calling internal API:', apiUrl);

    // [R6.5] Call existing vira-match-enhanced API internally
    const recommendationResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceCategory: intent.serviceCategory,
        projectScope: intent.projectScope
      })
    });

    if (!recommendationResponse.ok) {
      console.error('API call failed:', recommendationResponse.status, recommendationResponse.statusText);
      throw new Error(`Failed to get vendor recommendations: ${recommendationResponse.status}`);
    }

    const data = await recommendationResponse.json();
    console.log('API response received:', { 
      recommendations: data.recommendations?.length || 0,
      candidatesAnalyzed: data.candidatesAnalyzed 
    });
    
    if (!data.recommendations || data.recommendations.length === 0) {
      return `I couldn't find any vendors matching your criteria for "${intent.serviceCategory}". You might want to try a different service category or check if there are active vendors in our database.`;
    }

    // [R6.5] Format recommendations in conversational style
    const topRecommendations = data.recommendations.slice(0, 3);
    let response = `Based on your request for ${intent.serviceCategory} services, here are my top recommendations:\n\n`;

    topRecommendations.forEach((rec: RecommendationData, index: number) => {
      response += `**${index + 1}. ${rec.vendorName}** (${rec.viraScore}% match)\n`;
      response += `${rec.reason.substring(0, 150)}...\n`;
      response += `Key strengths: ${rec.keyStrengths.join(', ')}\n\n`;
    });

    response += `I analyzed ${data.candidatesAnalyzed} vendors for this recommendation. Would you like more details about any of these vendors or need help with a different type of project?`;

    return response;

  } catch (error) {
    console.error('Error getting vendor recommendations:', error);
    return `I'm having trouble accessing the vendor recommendation system right now. You can try using the ViRA Match page directly, or ask me something else about our vendors.`;
  }
}

// [R6.6] Search vendor database directly with robust error handling
async function searchVendorDatabase(searchTerm: string): Promise<VendorSearchResult[]> {
  try {
    // [R6.6] Use individual queries to avoid type casting issues with .or()
    let allResults: VendorSearchResult[] = [];

    // Search by vendor name
    const { data: nameVendors } = await supabase
      .from('vendors')
      .select(`
        vendor_name,
        service_categories,
        specialties,
        location,
        contact_name,
        contact_email
      `)
      .eq('status', 'Active')
      .ilike('vendor_name', `%${searchTerm}%`)
      .limit(10);

    if (nameVendors) {
      allResults = [...allResults, ...nameVendors];
    }

    // Search by service categories if we need more results
    if (allResults.length < 10) {
      const { data: serviceVendors } = await supabase
        .from('vendors')
        .select(`
          vendor_name,
          service_categories,
          specialties,
          location,
          contact_name,
          contact_email
        `)
        .eq('status', 'Active')
        .ilike('service_categories', `%${searchTerm}%`)
        .limit(10 - allResults.length);
      
      if (serviceVendors) {
        // Merge results, avoiding duplicates
        const existingNames = new Set(allResults.map(v => v.vendor_name));
        const newResults = serviceVendors.filter(v => !existingNames.has(v.vendor_name));
        allResults = [...allResults, ...newResults];
      }
    }

    // Search by specialties if we still need more results
    if (allResults.length < 10) {
      const { data: specialtyVendors } = await supabase
        .from('vendors')
        .select(`
          vendor_name,
          service_categories,
          specialties,
          location,
          contact_name,
          contact_email
        `)
        .eq('status', 'Active')
        .ilike('specialties', `%${searchTerm}%`)
        .limit(10 - allResults.length);
      
      if (specialtyVendors) {
        const existingNames = new Set(allResults.map(v => v.vendor_name));
        const newResults = specialtyVendors.filter(v => !existingNames.has(v.vendor_name));
        allResults = [...allResults, ...newResults];
      }
    }

    return allResults.slice(0, 10); // Ensure max 10 results
  } catch (error) {
    console.error('Database search error:', error);
    return [];
  }
}

// [R6.6] Format vendor search results for conversational response
async function formatVendorSearchResults(results: VendorSearchResult[], originalMessage: string): Promise<string> {
  if (results.length === 0) {
    return `I didn't find any vendors matching "${originalMessage}". Try searching for service categories like "web development", "content", or "data analytics", or ask me for recommendations instead.`;
  }

  let response = `I found ${results.length} vendor${results.length > 1 ? 's' : ''} matching your search:\n\n`;

  results.forEach((vendor, index) => {
    response += `**${index + 1}. ${vendor.vendor_name}**\n`;
    response += `Services: ${vendor.service_categories}\n`;
    if (vendor.specialties) {
      response += `Specialties: ${vendor.specialties}\n`;
    }
    if (vendor.location) {
      response += `Location: ${vendor.location}\n`;
    }
    if (vendor.contact_name && vendor.contact_email) {
      response += `Contact: ${vendor.contact_name} (${vendor.contact_email})\n`;
    }
    response += '\n';
  });

  response += 'Would you like me to provide detailed recommendations for any of these vendors, or help you with something else?';

  return response;
}

// [R6.7] Handle general conversation with Gemini AI
async function handleGeneralConversation(message: string, history: ChatMessage[]): Promise<string> {
  try {
    // [R6.7] Build conversation context for Gemini
    const contextMessages = history.slice(-6); // Last 3 exchanges for context
    const conversationContext = contextMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `
You are ViRA (Vendor Intelligence & Recommendation Assistant), a helpful AI assistant specialized in vendor management and project consulting.

CONTEXT: You help users find the right vendors for their projects, answer questions about vendor capabilities, and provide guidance on project requirements and vendor selection.

CONVERSATION HISTORY:
${conversationContext}

USER MESSAGE: ${message}

INSTRUCTIONS:
- Be helpful, professional, and conversational
- Focus on vendor-related topics when possible
- If users ask about vendor recommendations, guide them to be more specific about their needs
- If users ask about database queries, explain that you can help search vendors but complex queries might need the full interface
- Keep responses concise but informative
- Always offer to help with vendor recommendations or searches

RESPONSE:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return response.trim();

  } catch (error) {
    console.error('Gemini conversation error:', error);
    return `I'm having trouble processing that right now. I'm ViRA, your vendor intelligence assistant. I can help you find vendors, search our database, or answer questions about vendor selection. What would you like to know?`;
  }
}

// [R6.8] Export GET method for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ViRA Chat API is running',
    capabilities: [
      'vendor_recommendations',
      'vendor_search', 
      'general_conversation',
      'session_history'
    ],
    timestamp: new Date()
  });
}
