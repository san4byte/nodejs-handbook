# Todolist RESTful API Server

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Layanan RESTful API mandiri untuk operasi CRUD (_Create, Read, Update, Delete_) data to-do list menggunakan HTTP Server bawaan Node.js murni dengan pola arsitektur **Service Layer Pattern** tanpa dependensi pihak ketiga.
> - **Kapan Digunakan**: Studi kasus ideal untuk memahami bagaimana web server dan REST API bekerja di level fundamental sebelum beralih ke framework tingkat tinggi seperti Express, NestJS, atau Fastify.
> - **Aturan Praktis**: Pisahkan logika HTTP routing di `app.mjs` dari logika manipulasi data di `todolist.service.mjs`. Gunakan berkas `test.http` untuk menguji semua skenario request HTTP langsung dari editor.

---

## 1. 🎯 Tujuan Pembelajaran Proyek

- Membangun server RESTful API fungsional dari awal hanya bermodalkan modul `node:http`.
- Menerapkan arsitektur bersih pemisahan tanggung jawab (**Separation of Concerns**) menggunakan Service Layer (`TodolistService`).
- Menangani parsing request body streaming JSON secara asinkron via event `req.on('data')`.
- Menghasilkan format respons seragam berstandar industri: `{ code, status, data }`.
- Menyusun dokumentasi spesifikasi API standar (`apidoc.md` & `apidoc.json`).

---

## 2. 📖 Arsitektur & Spesifikasi Endpoint

### 🎭 Alur Arsitektur Request

```text
[HTTP Client / test.http / Postman]
              │ (HTTP Request: GET/POST/PUT/DELETE /api)
              ▼
    [app.mjs - HTTP Router]
       - Memeriksa request.url & request.method
       - Memanggil method service yang sesuai
              │
              ▼
[todolist.service.mjs - Service Layer]
   ├── getAllTodolist()   -> Mengambil array state JSON
   ├── createTodolist()   -> Parse stream data & push array
   ├── updateTodolist()   -> Ganti teks todo berdasarkan ID
   └── deleteTodolist()   -> Hapus elemen via splice(id, 1)
              │
              ▼
     [HTTP Response JSON]
   Status: 200 OK | Content-Type: application/json
```

---

### Tabel Kontrak REST API

| Method | Endpoint | Request Body | Keterangan Respon |
| :--- | :--- | :--- | :--- |
| `GET` | `/api` | _Kosong_ | Mengembalikan seluruh daftar todo item |
| `POST` | `/api` | `{"todo": "Belajar Docker"}` | Menambahkan item baru & mengembalikan list terbaru |
| `PUT` | `/api` | `{"id": 1, "todo": "Belajar K8s"}` | Mengubah isi todo pada indeks ID |
| `DELETE` | `/api` | `{"id": 0}` | Menghapus todo pada indeks ID |

---

## 3. 💻 Kode Praktik & Berkas Proyek

Berkas-berkas dalam proyek ini:
- [`app.mjs`](app.mjs): Titik masuk utama HTTP server, parser url, dan router request.
- [`todolist.service.mjs`](todolist.service.mjs): Lapisan layanan bisnis yang menyimpan in-memory state array dan fungsi manipulasi CRUD.
- [`test.http`](test.http): Koleksi request HTTP otomatis untuk pengujian GET, POST, PUT, dan DELETE.
- [`apidoc.md`](apidoc.md): Dokumentasi spesifikasi API berformat Markdown.
- [`apidoc.json`](apidoc.json): Spesifikasi JSON API definition.

---

## 4. 🛠️ Cara Menjalankan Server & Eksekusi Pengujian

### 1. Menjalankan Server

```bash
cd projects/todolist-rest-api
node app.mjs
```

Server akan aktif dan siap menerima request di port `3000`.

### 2. Menguji dengan Curl (Terminal Alternatif)

```bash
# 1. Mengambil semua data:
curl -X GET http://localhost:3000/api

# 2. Menambahkan todo baru:
curl -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"todo": "Belajar Node.js Core Modules"}'

# 3. Memperbarui todo (ID 0):
curl -X PUT http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"id": 0, "todo": "Menguasai Node.js Modern"}'

# 4. Menghapus todo (ID 0):
curl -X DELETE http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"id": 0}'
```

### 3. Menguji via REST Client VS Code

Buka file [`test.http`](test.http) di VS Code, lalu klik tombol **"Send Request"** di atas setiap blok request untuk melihat respons JSON langsung di editor.

---

## 5. 🧭 Navigasi

- ⬅️ **Kembali ke Modul 06 Database:** [06 - Modern Database Persistence with Prisma ORM](../../06-database-prisma/README.md)
- 🏠 **Daftar Proyek:** [README Direktori Projects](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

