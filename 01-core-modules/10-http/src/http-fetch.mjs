/**
 * 14 - HTTP Client Modern Menggunakan Global fetch() di Node.js
 *
 * Demonstrasi pemanggilan HTTP Request modern berbasis Promise & async/await
 * menggunakan WHATWG fetch API bawaan runtime Node.js (v18+).
 */

import http from 'node:http';

console.log('=== 1. Menjalankan Server Lokal Mini untuk Simulasi ===');

// Membuat server lokal mini agar demo fetch dapat berjalan offline tanpa dependensi luar
const localServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/user') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ id: 101, name: 'Joko Santoso', role: 'Engineer' }),
    );
  } else if (req.method === 'POST' && req.url === '/api/login') {
    let chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'success',
          token: 'jwt-dummy-12345',
          user: body.username,
        }),
      );
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint tidak ditemukan' }));
  }
});

// Dengarkan pada port acak yang tersedia (port 0 = OS memilihkan port dinamis)
localServer.listen(0, async () => {
  const { port } = localServer.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Server simulasi aktif di ${baseUrl}`);

  try {
    // -------------------------------------------------------------------------
    // 2. HTTP GET Request Modern
    // -------------------------------------------------------------------------
    console.log('\n=== 2. Eksekusi HTTP GET via fetch() ===');
    const getResponse = await fetch(`${baseUrl}/api/user`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      // Standar Industri: Selalu sertakan timeout agar tidak menggantung jika server lemot
      signal: AbortSignal.timeout(3000),
    });

    if (!getResponse.ok) {
      throw new Error(`HTTP Error: ${getResponse.status}`);
    }

    const userData = await getResponse.json();
    console.log('Status HTTP  :', getResponse.status, getResponse.statusText);
    console.log('Data Response:', userData);

    // -------------------------------------------------------------------------
    // 3. HTTP POST Request Modern dengan JSON Body
    // -------------------------------------------------------------------------
    console.log('\n=== 3. Eksekusi HTTP POST via fetch() ===');
    const postPayload = { username: 'jokosantoso', password: 'secretpassword' };

    const postResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(postPayload),
      signal: AbortSignal.timeout(3000),
    });

    const loginResult = await postResponse.json();
    console.log('Status HTTP  :', postResponse.status, postResponse.statusText);
    console.log('Data Response:', loginResult);

    console.log('\n=== 4. Kesimpulan ===');
    console.log(
      '✓ fetch() di Node.js jauh lebih ringkas daripada https.request() kuno.',
    );
    console.log(
      '✓ Mendukung async/await, method chaining (.json()), dan AbortSignal native.',
    );
  } catch (error) {
    console.error('Terjadi kesalahan fetch:', error.message);
  } finally {
    // Tutup server simulasi agar proses Node.js selesai dengan rapi
    localServer.close();
  }
});
