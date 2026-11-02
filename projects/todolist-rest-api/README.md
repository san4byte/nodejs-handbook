# Todolist RESTful API Server

> Layanan RESTful API mandiri untuk operasi CRUD data todo list menggunakan HTTP Server bawaan Node.js dengan pemisahan tanggung jawab berbasis Service Layer tanpa framework eksternal.

## Core Concepts

- Routing HTTP murni ditentukan melalui inspeksi kombinasi properti `req.method` dan `req.url`.
- Service Layer (`TodolistService`) memisahkan urusan parsing protokol HTTP dari logika bisnis data.
- Stream request body dikumpulkan secara asinkron sebelum parsing JSON dilakukan.
- Format response terstandarisasi seragam: `{ code, status, data }`.

## Referensi

Daftar endpoint RESTful API:

| Endpoint | Method | Request Body | Status | Fungsi |
|---|---|---|---|---|
| `/api` | `GET` | _(Kosong)_ | `200 OK` | Mengambil seluruh daftar item todo |
| `/api` | `POST` | `{"todo": string}` | `200 OK` | Menambahkan item todo baru |
| `/api` | `PUT` | `{"id": number, "todo": string}` | `200 OK` | Memperbarui teks todo berdasarkan indeks ID |
| `/api` | `DELETE` | `{"id": number}` | `200 OK` | Menghapus todo berdasarkan indeks ID |

### `GET /api`

Endpoint ini mengambil seluruh item koleksi todo aktif.

- Tidak memerlukan request payload.
- **Returns:** objek JSON `{ code: 200, status: "OK", data: Array<{ id: number, todo: string }> }`.

```bash
curl -X GET http://localhost:3000/api
# Output: {"code":200,"status":"OK","data":[{"id":0,"todo":"nodejs"}]}
```

### `POST /api`

Endpoint ini menambahkan satu item todo baru ke dalam daftar.

- `todo` (string, required): Teks catatan aktivitas yang disimpan.
- **Returns:** objek JSON respons berisi seluruh daftar todo yang telah diperbarui.

```bash
curl -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"todo": "Learn Node.js core"}'
# Output: {"code":200,"status":"OK","data":[{"id":0,"todo":"nodejs"},{"id":1,"todo":"Learn Node.js core"}]}
```

### `PUT /api`

Endpoint ini memperbarui teks todo pada indeks tertentu.

- `id` (number, required): Indeks posisi item target.
- `todo` (string, required): Teks baru pengganti.
- **Returns:** objek JSON respons berisi seluruh daftar todo terbaru.

```bash
curl -X PUT http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"id": 0, "todo": "Learn Node.js advanced"}'
# Output: {"code":200,"status":"OK","data":[{"id":0,"todo":"Learn Node.js advanced"}]}
```

### `DELETE /api`

Endpoint ini menghapus satu rekaman todo berdasarkan indeksnya.

- `id` (number, required): Indeks posisi item yang dihapus.
- **Returns:** objek JSON respons dengan item yang telah dihapus dari array.

```bash
curl -X DELETE http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"id": 0}'
# Output: {"code":200,"status":"OK","data":[]}
```

## Examples

### 1. Inisialisasi HTTP Server dan Router

```js title="app.mjs"
import http from 'node:http';
import { TodolistService } from './todolist.service.mjs';

const service = new TodolistService();

export const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/api') {
    service.getAllTodolist(req, res);
    return;
  }
  if (req.method === 'POST' && req.url === '/api') {
    service.createTodolist(req, res);
    return;
  }
  res.writeHead(404).end(JSON.stringify({ code: 404, status: 'Not Found' }));
});
// Output: Server running and routing requests to TodolistService
```

## Real-World Use Case

**Backend**

**Masalah:** memverifikasi bahwa HTTP server membalas dengan header `application/json` dan format response seragam tanpa ketergantungan framework Express.
**Solusi:** router mengekstrak body stream, mendelegasikannya ke `TodolistService`, lalu mengirim respon JSON terstruktur.

```js title="client-test.mjs"
const response = await fetch('http://localhost:3000/api');
const result = await response.json();
console.log('API Status:', result.status);
console.log('Is array:', Array.isArray(result.data));
// Output: API Status: OK
// Output: Is array: true
```

## Pitfalls

- Menulis logika data langsung di dalam callback `http.createServer()`. Hal ini mencampur urusan routing jaringan dan manipulasi state.
  ```js
  // ❌ Incorrect: tightly coupling data mutations inside router
  // if (req.url === '/api') { todoList.push(item); res.end(); }

  // ✅ Correct: isolate business logic inside dedicated service methods
  if (req.method === 'POST' && req.url === '/api') {
    service.createTodolist(req, res);
  }
  ```
- Tidak menangani kegagalan parsing JSON pada body request (`SyntaxError`), yang dapat membuat server crash ketika client mengirim format data rusak.
  ```js
  // ✅ Correct: guard JSON.parse with try...catch
  try {
    const body = JSON.parse(rawChunk);
  } catch (err) {
    res.writeHead(400).end(JSON.stringify({ error: 'Malformed JSON' }));
  }
  ```

## References

- [Node.js Docs: HTTP Transaction Anatomy](https://nodejs.org/en/learn/modules/anatomy-of-an-http-transaction)

---

Sebelumnya: [06 - Database](../../06-database/README.md)
