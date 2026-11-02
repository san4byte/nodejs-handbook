# HTTP Server & Client

> Modul `node:http` menyediakan arsitektur server HTTP tingkat rendah tanpa framework, serta integrasi client API modern menggunakan native `fetch()`.

## Core Concepts

- Instance `http.Server` adalah turunan `EventEmitter` yang memancarkan event seperti `'request'` dan `'close'`.
- `req` (*IncomingMessage*) adalah `Readable` stream; parsing body request dikumpulkan via chunk buffer pada stream.
- `res` (*ServerResponse*) adalah `Writable` stream; selalu panggil `res.end()` agar koneksi tidak menggantung (*hang*).
- Node.js versi modern menyediakan native `fetch()` global berbasis standar Web API tanpa library eksternal.

## Referensi

Daftar API modul `node:http` dan client:

| API / Fitur | Fungsi |
|---|---|
| `http.createServer(options?, requestListener)` | Membuat instance HTTP server baru dengan callback penangan request |
| `res.writeHead(statusCode, headers?)` | Mengirim status code dan response headers secara eksplisit |
| `res.end(data?, encoding?, callback?)` | Menandakan seluruh header dan data respons selesai dikirim |
| `fetch(url, options?)` | Web API global untuk melakukan HTTP request client berbasis Promise |

### `http.createServer(options?, requestListener)`

Fungsi ini menginisialisasi server HTTP baru.

- `options` (object, optional): Opsi koneksi socket seperti `keepAlive` (boolean) dan `keepAliveTimeout` (number).
- `requestListener` ((req: IncomingMessage, res: ServerResponse) => void, optional): Callback otomatis terdaftar ke event `'request'`.
- **Returns:** `http.Server`, instance server HTTP baru.

```js
import http from 'node:http';

const server = http.createServer({ keepAlive: true }, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server ready');
});
```

### `res.writeHead(statusCode, headers?)`

Metode ini mengirimkan baris status kode HTTP dan header respons ke client sebelum data body dikirimkan.

- `statusCode` (number, required): Kode status HTTP 3 digit (misalnya `200`, `201`, `404`).
- `headers` (object | Array, optional): Pasangan key-value header respons (seperti `'Content-Type'`).
- **Returns:** `ServerResponse`, instance respons saat ini.

```js
res.writeHead(201, {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
});
```

### `res.end(data?, encoding?, callback?)`

Metode ini menandakan bahwa seluruh header dan konten data respons telah selesai dikirim.

- `data` (string | Buffer, optional): Data payload terakhir yang dikirim sebelum penutupan stream.
- `encoding` (string, optional, default `'utf8'`): Format pengkodean karakter data string.
- `callback` (() => void, optional): Callback saat aliran data respons tuntas terkirim.
- **Returns:** `ServerResponse`, instance respons saat ini.

```js
res.end(JSON.stringify({ status: 'completed' }), 'utf8', () => {
  console.log('Response stream closed');
});
// Output: Response stream closed
```

### `fetch(url, options?)`

Fungsi global ini melakukan request HTTP dari sisi client berbasis Promise.

- `url` (string | URL | Request, required): Alamat endpoint target pemanggilan HTTP.
- `options` (object, optional): Opsi konfigurasi request seperti `method`, `headers`, `body`, dan `signal`.
- **Returns:** Promise<Response>, representasi respons HTTP dengan helper `.json()` dan `.text()`.

```js
const response = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alex' }),
});

const payload = await response.json();
console.log(response.status, payload.created);
// Output: 201 true
```

## Examples

### 1. HTTP Server dan Client Native Lengkap

```js title="src/client.mjs"
// run: node src/client.mjs
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ echoed: 'Hello from client!' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

server.listen(0, async () => {
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/health`);
  const body = await res.text();
  console.log('GET /health status:', res.status, 'body:', body);

  const postRes = await fetch(`http://localhost:${port}/echo`, {
    method: 'POST',
  });
  const postData = await postRes.json();
  console.log('POST /echo status:', postRes.status, 'echoed:', postData.echoed);
  server.close();
});
// Output: GET /health status: 200 body: ok
// Output: POST /echo status: 200 echoed: Hello from client!
```

## Real-World Use Case

**Backend**

**Masalah:** memparsing payload JSON berukuran besar pada endpoint POST mentah tanpa framework Express, dengan proteksi agar parsing error tidak membuat server crash.
**Solusi:** kumpulkan potongan body stream lewat event `'data'`, lalu bungkus `JSON.parse` dalam blok `try...catch` dan kembalikan status 400 jika JSON rusak.

```js title="json-server.mjs"
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: parsed }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed JSON' }));
      }
    });
    return;
  }
  res.writeHead(404).end('Not Found');
});

server.listen(0, async () => {
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'ok' }),
  });
  const data = await res.json();
  console.log('Received:', data.received.status);
  server.close();
});
// Output: Received: ok
```

## Pitfalls

- Lupa memanggil `res.end()`. Client (seperti browser atau curl) akan menunggu (*timeout*) tanpa henti.
  ```js
  // ❌ Incorrect: response connection left hanging indefinitely
  http.createServer((req, res) => {
    res.writeHead(200);
    // Missing res.end()
  });

  // ✅ Correct: always close response stream
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Done');
  });
  ```
- Menulis header setelah data respons ditutup atau dikirim (`ERR_HTTP_HEADERS_SENT`).
  ```js
  // ❌ Incorrect: setting header after response finished
  res.end('Hello');
  // res.setHeader('Content-Type', 'text/plain'); // Throws ERR_HTTP_HEADERS_SENT

  // ✅ Correct: configure headers before sending body
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello');
  ```

## References

- [Node.js Docs: HTTP](https://nodejs.org/api/http.html)

---

Sebelumnya: [06 - Timers & Async](../06-timers-async/README.md) | Berikutnya: [08 - Crypto](../08-crypto/README.md)
