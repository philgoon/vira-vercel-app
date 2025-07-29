'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VendorPageProps {
  params: { id: string };
}

export default function VendorDetailsPage({ params }: VendorPageProps) {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/vendors?id=${params.id}`);
        const data = await response.json();
        const vendorData = data.vendors?.find((v: any) => v.vendor_id.toString() === params.id);
        setVendor(vendorData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => router.push('/vendors')}>
        ← Back to Vendors
      </button>
      <h1>{vendor.vendor_name}</h1>
      <p>Status: {vendor.status}</p>
      <p>Categories: {vendor.service_categories}</p>
    </div>
  );
}