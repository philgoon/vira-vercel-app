import dotenv from 'dotenv';
dotenv.config();

console.log('--- test-env.ts ---');
console.log('Attempting to load POSTGRES_URL from .env.local...');
const pgUrl = process.env.POSTGRES_URL;

if (pgUrl) {
  console.log('POSTGRES_URL loaded: YES (partially masked)');
  console.log(pgUrl.substring(0, 20) + '...');
} else {
  console.log('POSTGRES_URL loaded: NO - variable not found.');
}
console.log('--- test-env.ts finished ---');
