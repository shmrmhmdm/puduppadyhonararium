import { INITIAL_MEMBERS, INITIAL_MEETINGS, INITIAL_ATTENDANCE, STATUTORY_RATES } from './src/data/initialData.js';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby3l_BkJOlaK1Vva2QxNOOt4KjdbdNoa5SFTzgI9eApdsmKCdPs5CpVpz7X6Sub6kG-KA/exec';

async function seedSheet() {
  console.log('Sending initial 24 wards data to Google Sheet...');
  const payload = {
    action: 'SYNC_ALL',
    members: INITIAL_MEMBERS,
    meetings: INITIAL_MEETINGS,
    attendance: INITIAL_ATTENDANCE,
    rates: STATUTORY_RATES
  };

  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('Response status:', res.status);
  const text = await res.text();
  console.log('Response body:', text);
}

seedSheet().catch(console.error);
