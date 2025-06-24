// [R8.1] Add sample vendor data with service categories for testing
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  try {
    // [R8.1] Sample vendor data with service categories
    const sampleVendors = [
      {
        vendor_name: "TechCraft Solutions",
        service_categories: "Web Development",
        specialties: "React, Next.js, e-commerce platforms, custom web applications",
        location: "New York, NY",
        contact_name: "Sarah Johnson",
        contact_email: "sarah@techcraft.com",
        contact_phone: "(555) 123-4567",
        time_zone: "EST",
        pricing_notes: "$75-125/hour",
        status: "Active",
        onboarding_date: "2023-01-15",
        vendor_notes: "Excellent track record with React applications"
      },
      {
        vendor_name: "DesignPro Studio",
        service_categories: "Graphic Design",
        specialties: "Brand identity, UI/UX design, marketing materials, logos",
        location: "Los Angeles, CA",
        contact_name: "Mike Chen",
        contact_email: "mike@designpro.com",
        contact_phone: "(555) 234-5678",
        time_zone: "PST",
        pricing_notes: "$50-80/hour",
        status: "Active",
        onboarding_date: "2023-02-20",
        vendor_notes: "Creative team with strong brand experience"
      },
      {
        vendor_name: "DataFlow Analytics",
        service_categories: "Data Analysis",
        specialties: "Business intelligence, data visualization, machine learning, reporting",
        location: "Austin, TX",
        contact_name: "Dr. Lisa Rodriguez",
        contact_email: "lisa@dataflow.com",
        contact_phone: "(555) 345-6789",
        time_zone: "CST",
        pricing_notes: "$90-150/hour",
        status: "Active",
        onboarding_date: "2023-03-10",
        vendor_notes: "PhD-level expertise in data science"
      },
      {
        vendor_name: "CloudSecure IT",
        service_categories: "IT Support",
        specialties: "Cloud infrastructure, cybersecurity, system administration, DevOps",
        location: "Seattle, WA",
        contact_name: "James Wilson",
        contact_email: "james@cloudsecure.com",
        contact_phone: "(555) 456-7890",
        time_zone: "PST",
        pricing_notes: "$85-120/hour",
        status: "Active",
        onboarding_date: "2023-04-05",
        vendor_notes: "Certified in AWS, Azure, and Google Cloud"
      },
      {
        vendor_name: "ContentMasters Agency",
        service_categories: "Content Creation",
        specialties: "Copywriting, content strategy, social media, video production",
        location: "Chicago, IL",
        contact_name: "Emma Thompson",
        contact_email: "emma@contentmasters.com",
        contact_phone: "(555) 567-8901",
        time_zone: "CST",
        pricing_notes: "$40-70/hour",
        status: "Active",
        onboarding_date: "2023-05-12",
        vendor_notes: "Full-service content team with video capabilities"
      },
      {
        vendor_name: "MobileCraft Apps",
        service_categories: "Mobile Development",
        specialties: "iOS apps, Android apps, React Native, Flutter, app store optimization",
        location: "San Francisco, CA",
        contact_name: "Alex Kim",
        contact_email: "alex@mobilecraft.com",
        contact_phone: "(555) 678-9012",
        time_zone: "PST",
        pricing_notes: "$80-140/hour",
        status: "Active",
        onboarding_date: "2023-06-18",
        vendor_notes: "Published 50+ apps on both platforms"
      },
      {
        vendor_name: "GrowthHack Marketing",
        service_categories: "Digital Marketing",
        specialties: "SEO, PPC advertising, social media marketing, email campaigns",
        location: "Miami, FL",
        contact_name: "Carlos Rodriguez",
        contact_email: "carlos@growthhack.com",
        contact_phone: "(555) 789-0123",
        time_zone: "EST",
        pricing_notes: "$60-95/hour",
        status: "Active",
        onboarding_date: "2023-07-22",
        vendor_notes: "Proven ROI improvements for B2B and B2C clients"
      },
      {
        vendor_name: "LegalEase Consulting",
        service_categories: "Legal Services",
        specialties: "Business law, contract review, intellectual property, compliance",
        location: "Boston, MA",
        contact_name: "Jennifer Park",
        contact_email: "jennifer@legalease.com",
        contact_phone: "(555) 890-1234",
        time_zone: "EST",
        pricing_notes: "$200-350/hour",
        status: "Active",
        onboarding_date: "2023-08-30",
        vendor_notes: "20+ years experience in tech and startup law"
      }
    ];

    // [R8.1] Insert sample vendors
    const { data: insertedVendors, error } = await supabase
      .from('vendors')
      .insert(sampleVendors)
      .select();

    if (error) {
      console.error('Error inserting sample vendors:', error);
      return NextResponse.json({ error: 'Failed to insert sample vendors' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully added ${insertedVendors.length} sample vendors`,
      vendors: insertedVendors
    });

  } catch (error) {
    console.error('Sample data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
