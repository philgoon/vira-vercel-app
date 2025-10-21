// Generate embeddings for all projects and vendors

async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/admin/generate-embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: 'all' }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Embedding generation complete!\n');
      console.log('📊 Results:');
      console.log(`  Projects: ${data.results.projects.success}/${data.results.projects.processed} successful`);
      console.log(`  Vendors: ${data.results.vendors.success}/${data.results.vendors.processed} successful`);
      
      if (data.results.projects.errors > 0 || data.results.vendors.errors > 0) {
        console.log(`\n⚠️  Errors: ${data.results.projects.errors + data.results.vendors.errors}`);
      }
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Failed to generate embeddings:', error.message);
    console.log('\n💡 Make sure your dev server is running: npm run dev');
  }
}

generateEmbeddings();
