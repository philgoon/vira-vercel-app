'use client';

import { use } from 'react';

// Simple test page to verify dynamic routing works
export default function SimpleVendorPage({ params }: { params: Promise<{ id: string }> }) {
  // Use React 19's use() hook to handle the promise
  const { id } = use(params);
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Simple Vendor Page</h1>
      <p>Vendor ID: {id}</p>
      <a href="/vendors">← Back to vendors</a>
    </div>
  );
}