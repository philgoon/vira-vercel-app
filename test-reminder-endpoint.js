// Test the review reminder cron endpoint locally
const cronSecret = 'vJk8mN2pQr5tX9wC4bY7dF3gH6jL1nM0';

async function testReminders() {
  console.log('Testing review reminder endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/cron/send-reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Reminder system working!');
      console.log(`   - Initial reminders: ${data.reminders_sent.initial}`);
      console.log(`   - First reminders: ${data.reminders_sent.first_reminder}`);
      console.log(`   - Second reminders: ${data.reminders_sent.second_reminder}`);
      console.log(`   - Final reminders: ${data.reminders_sent.final_reminder}`);
      console.log(`   - Errors: ${data.reminders_sent.errors}`);
    } else {
      console.log('\n❌ Reminder system failed:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testReminders();
