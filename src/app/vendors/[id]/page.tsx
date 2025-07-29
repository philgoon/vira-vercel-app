'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VendorPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailsPage({ params }: VendorPageProps) {
  const { id } = await params;
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchVendor() {
      try {
        const response = await fetch(`/api/vendors?id=${id}`);
        const data = await response.json();
        const vendorData = data.vendors?.find((v: any) => v.vendor_id.toString() === id);
        setVendor(vendorData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [id]);

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