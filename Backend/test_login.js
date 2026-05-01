(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aquatrack.com', password: '1234' })
    });

    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('HEADERS', [...res.headers.entries()]);
    console.log('BODY', text);
  } catch (err) {
    console.error('REQUEST ERROR', err.message);
  }
})();
