const conn = 'postgresql://neondb_owner:npg_t34ZoROkwBaC@ep-weathered-base-aogbm4fb.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function testHttp() {
  try {
    const res = await fetch('https://ep-weathered-base-aogbm4fb.c-2.ap-southeast-1.aws.neon.tech/sql', {
      method: 'POST',
      headers: {
        'Neon-Connection-String': conn,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'SELECT id, name, email, role FROM "User" LIMIT 5;'
      })
    });
    const data = await res.json();
    console.log('HTTP Query result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('HTTP Query error:', err);
  }
}

testHttp();
