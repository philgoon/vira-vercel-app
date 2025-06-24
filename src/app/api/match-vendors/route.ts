// [R1.3] Updated match-vendors API route using actual Supabase schema
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // [R2.1] Using Supabase client
import { genAI } from '@/lib/ai'; // [R1.3] Using Gemini AI client

// [ISA] Use Next.js App Router API route conventions.
export async function POST(request: Request) {
  try {
    // [R1.3] Parse project requirements from the request body.
    const { scope, budget, location, preferredVendorAttributes } = await request.json();

    // [R2.1] Fetch all active vendors from Supabase to provide context to the AI.
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select(`
        vendor_id, 
        vendor_name, 
        service_categories,
        specialties, 
        location,
        pricing_notes,
        status,
        contact_name,
        contact_email
      `)
      .eq('status', 'Active');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
    }

    if (!vendors || vendors.length === 0) {
      // [REH] Handle case where no vendors are in the database.
      return NextResponse.json({ recommendations: [] });
    }

    // [R1.3] Construct a detailed prompt for the Gemini AI model.
    const prompt = `
      Project Requirements:
      - Scope: ${scope}
      - Budget: $${budget}
      - Location: ${location}
      - Preferred Attributes: ${preferredVendorAttributes || 'None specified'}

      Available Vendors:
      ${vendors.map(vendor => `
        - ${vendor.vendor_name}
          Service Categories: ${vendor.service_categories || 'Not specified'}
          Specialties: ${vendor.specialties || 'Not specified'}
          Location: ${vendor.location || 'Not specified'}
          Pricing: ${vendor.pricing_notes || 'Not specified'}
          Status: ${vendor.status || 'Unknown'}
          Contact: ${vendor.contact_name || 'Not available'}
      `).join('\n')}

      Based on the project requirements above, please recommend the top 3-5 vendors from the list that would be the best fit. For each recommendation, provide a clear, specific reason explaining why they match the requirements.

      Consider:
      1. Budget compatibility with their pricing structure
      2. Relevant specialties and experience for the project scope
      3. Service category alignment
      4. Location compatibility if relevant
      5. Overall suitability for the project type

      Your response must be a valid JSON array of objects, where each object has a "vendorName" (string) and a "reason" (string). Do not include any other text, just the JSON.
      
      Example format: [{ "vendorName": "Example Vendor Inc.", "reason": "They specialize in the required technology stack, have experience in your industry, and their pricing structure fits your budget of $${budget}." }]
    `;

    // [R1.3] Call the Gemini API to get recommendations.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    // [REH] Clean up the response to ensure it's valid JSON.
    const cleanedJsonString = responseText.replace(/```json|```/g, '').trim();
    
    let recommendations;
    try {
      recommendations = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', responseText);
      
      // [REH] Fallback to a simple recommendation based on service category matching
      const fallbackRecommendations = vendors
        .slice(0, 3)
        .map(vendor => ({
          vendorName: vendor.vendor_name,
          reason: `Professional ${vendor.service_categories || 'service provider'} with relevant experience in ${vendor.specialties || 'your industry'}.`
        }));
      
      return NextResponse.json({ 
        recommendations: fallbackRecommendations,
        note: 'Using fallback recommendations due to AI response parsing error'
      });
    }

    // [R1.3] Return the AI-generated recommendations.
    return NextResponse.json({ recommendations });

  } catch (error) {
    // [REH] Provide a structured error response.
    console.error('Error in match-vendors API:', error);
    return NextResponse.json(
      { error: 'An error occurred while matching vendors.' },
      { status: 500 }
    );
  }
}
