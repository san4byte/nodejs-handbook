import http from 'node:http';

// SOAL 1 (Dasar) - fetchWithTimeout
async function fetchWithTimeout(url, timeoutMs) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        status: res.status,
        data,
      };
    }

    return {
      success: false,
      reason: `HTTP_${res.status}`,
    };
  } catch (error) {
    if (error.name === 'TimeoutError') {
      return {
        success: false,
        reason: 'TIMEOUT',
      };
    }

    return {
      success: false,
      reason: 'CONNECTION_FAILED',
    };
  }
}

console.log('--- Pengujian Soal 1 ---');
// 1. Sukses (200 OK)
const server1A = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello Node' }));
});
await new Promise((resolve) => server1A.listen(0, '127.0.0.1', resolve));
const port1A = server1A.address().port;
const result1A = await fetchWithTimeout(`http://127.0.0.1:${port1A}`, 1000);
console.log('Soal 1 (Sukses 200):', result1A);
await new Promise((resolve) => server1A.close(resolve));

// 2. Koneksi Gagal (port 1 tertutup)
const result1B = await fetchWithTimeout('http://127.0.0.1:1', 500);
console.log('Soal 1 (Koneksi Gagal):', result1B);

// 3. Batas Waktu Habis (Timeout)
const server1C = http.createServer(() => {});
await new Promise((resolve) => server1C.listen(0, '127.0.0.1', resolve));
const port1C = server1C.address().port;
const result1C = await fetchWithTimeout(`http://127.0.0.1:${port1C}`, 100);
console.log('Soal 1 (Timeout):', result1C);
await new Promise((resolve) => server1C.close(resolve));

// SOAL 2 (Menengah) - parseJsonBody
function parseJsonBody(req, maxByteSize) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxByteSize) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      try {
        const data = JSON.parse(raw);
        resolve(data);
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

console.log('\n--- Pengujian Soal 2 ---');
// 1. Sukses parsing payload sah
const server2A = http.createServer(async (req, res) => {
  try {
    const body = await parseJsonBody(req, 1024);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  } catch (error) {
    res.writeHead(400);
    res.end(error.message);
  }
});
await new Promise((resolve) => server2A.listen(0, '127.0.0.1', resolve));
const port2A = server2A.address().port;
const res2A = await fetch(`http://127.0.0.1:${port2A}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Laptop', price: 15000000 }),
});
console.log('Soal 2 (Payload Sah):', await res2A.json());
await new Promise((resolve) => server2A.close(resolve));

// 2. Payload Melebihi Batas (PAYLOAD_TOO_LARGE)
let err2B = '';
const server2B = http.createServer(async (req, res) => {
  try {
    await parseJsonBody(req, 1000);
    res.writeHead(200);
    res.end('OK');
  } catch (error) {
    err2B = error.message;
    res.destroy();
  }
});
await new Promise((resolve) => server2B.listen(0, '127.0.0.1', resolve));
const port2B = server2B.address().port;
try {
  await fetch(`http://127.0.0.1:${port2B}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'A'.repeat(1500) }),
  });
} catch {
  // Mengabaikan pemutusan koneksi sepihak dari server
}
console.log('Soal 2 (Payload Terlalu Besar):', err2B);
await new Promise((resolve) => server2B.close(resolve));

// 3. JSON Tidak Valid (INVALID_JSON)
let err2C = '';
const server2C = http.createServer(async (req, res) => {
  try {
    await parseJsonBody(req, 1024);
    res.writeHead(200);
    res.end('OK');
  } catch (error) {
    err2C = error.message;
    res.writeHead(400);
    res.end(error.message);
  }
});
await new Promise((resolve) => server2C.listen(0, '127.0.0.1', resolve));
const port2C = server2C.address().port;
await fetch(`http://127.0.0.1:${port2C}`, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: 'Bukan Format JSON',
});
console.log('Soal 2 (JSON Tidak Valid):', err2C);
await new Promise((resolve) => server2C.close(resolve));

// SOAL 3 (Menantang) - createGatewayServer
function createGatewayServer(routeMap) {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = req.url;

      const matchedRoute = Object.entries(routeMap).find(([prefix]) =>
        pathname.startsWith(prefix),
      );

      if (!matchedRoute) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gateway route not found' }));
        return;
      }

      const [prefix, upstreamUrl] = matchedRoute;
      const subPath = pathname.slice(prefix.length) || '/';
      const targetUrl = new URL(subPath, upstreamUrl);

      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const upstreamResponse = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: hasBody ? req : undefined,
        signal: AbortSignal.timeout(1500),
        duplex: 'half',
      });

      const body = await upstreamResponse.arrayBuffer();

      res.writeHead(
        upstreamResponse.status,
        Object.fromEntries(upstreamResponse.headers),
      );
      res.end(Buffer.from(body));
    } catch (error) {
      if (error.name === 'TimeoutError') {
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Gateway Timeout' }));
      } else {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Gateway' }));
      }
    }
  });

  return server;
}

console.log('\n--- Pengujian Soal 3 ---');
// 1. Sukses Diteruskan ke Upstream (200 OK)
const upstream3A = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ token: 'auth-jwt-token-123' }));
});
await new Promise((resolve) => upstream3A.listen(0, '127.0.0.1', resolve));
const port3A_up = upstream3A.address().port;

const gateway3A = createGatewayServer({
  '/auth': `http://127.0.0.1:${port3A_up}`,
});
await new Promise((resolve) => gateway3A.listen(0, '127.0.0.1', resolve));
const port3A_gw = gateway3A.address().port;

const res3A = await fetch(`http://127.0.0.1:${port3A_gw}/auth/token`);
console.log('Soal 3 (Sukses Upstream):', res3A.status, await res3A.json());
await new Promise((resolve) => gateway3A.close(resolve));
await new Promise((resolve) => upstream3A.close(resolve));

// 2. Rute Tidak Terdaftar (404 Not Found)
const gateway3B = createGatewayServer({
  '/auth': 'http://127.0.0.1:4001',
});
await new Promise((resolve) => gateway3B.listen(0, '127.0.0.1', resolve));
const port3B_gw = gateway3B.address().port;
const res3B = await fetch(`http://127.0.0.1:${port3B_gw}/unknown`);
console.log('Soal 3 (Rute Tidak Ditemukan):', res3B.status, await res3B.json());
await new Promise((resolve) => gateway3B.close(resolve));

// 3. Upstream Offline (502 Bad Gateway)
const gateway3C = createGatewayServer({
  '/offline': 'http://127.0.0.1:1',
});
await new Promise((resolve) => gateway3C.listen(0, '127.0.0.1', resolve));
const port3C_gw = gateway3C.address().port;
const res3C = await fetch(`http://127.0.0.1:${port3C_gw}/offline/test`);
console.log('Soal 3 (Upstream Offline):', res3C.status, await res3C.json());
await new Promise((resolve) => gateway3C.close(resolve));

// 4. Upstream Menggantung (504 Gateway Timeout)
const slowUpstream3D = http.createServer(() => {});
await new Promise((resolve) => slowUpstream3D.listen(0, '127.0.0.1', resolve));
const port3D_slow = slowUpstream3D.address().port;

const gateway3D = createGatewayServer({
  '/slow': `http://127.0.0.1:${port3D_slow}`,
});
await new Promise((resolve) => gateway3D.listen(0, '127.0.0.1', resolve));
const port3D_gw = gateway3D.address().port;

const res3D = await fetch(`http://127.0.0.1:${port3D_gw}/slow/data`);
console.log('Soal 3 (Gateway Timeout):', res3D.status, await res3D.json());
await new Promise((resolve) => gateway3D.close(resolve));
await new Promise((resolve) => slowUpstream3D.close(resolve));
