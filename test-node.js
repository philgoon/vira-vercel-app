console.log('--- test-node.js execution START ---');

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
console.log(`Checking for .env.local at: ${envPath}`);

try {
  const fileContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env.local content loaded by fs.readFileSync. First 50 chars:');
  console.log(fileContent.substring(0, 50) + (fileContent.length > 50 ? '...' : ''));
  
  // Crude check for POSTGRES_URL
  if (fileContent.includes('POSTGRES_URL=')) {
    console.log('Found POSTGRES_URL= in the file content.');
  } else {
    console.log('POSTGRES_URL= was NOT found in the file content.');
  }

} catch (e) {
  console.error(`.env.local file NOT readable by fs.readFileSync or does not exist at path ${envPath}. Error:`);
  console.error(e.message);
}

console.log('--- test-node.js execution END ---');
