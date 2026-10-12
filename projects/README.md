# 🚀 Capstone Projects: Implementasi Nyata Node.js

Selamat datang di direktori **Capstone Projects**! Direktori ini memuat implementasi proyek aplikasi backend nyata yang menggabungkan seluruh konsep teori yang telah dipelajari di Modul 01 hingga 06 ke dalam produk yang berfungsi secara utuh.

---

## 📂 Daftar Proyek

### 1. [Todolist RESTful API Server](todolist-rest-api/README.md)

- **Deskripsi**: Server RESTful API lengkap untuk manajemen daftar tugas (Todolist) yang dibangun menggunakan HTTP Server native Node.js tanpa framework eksternal, menerapkan pola arsitektur **Service Layer**, format data JSON standar, serta berkas pengujian HTTP siap eksekusi.
- **Teknologi**: Node.js Core HTTP (`node:http`), ES Modules (`.mjs`), Service-Layer Architecture, JSON REST Protocol.
- **Fitur Utama**:
  - `GET /api`: Mengambil seluruh daftar Todo item beserta indeks ID.
  - `POST /api`: Menambahkan todo item baru ke memori.
  - `PUT /api`: Memperbarui todo item berdasarkan ID.
  - `DELETE /api`: Menghapus todo item berdasarkan ID.
  - Pengujian HTTP interaktif melalui `test.http`.
  - Dokumentasi kontrak API terstandarisasi (`apidoc.md` & `apidoc.json`).

---

## 🛠️ Cara Menjalankan Proyek

```bash
# 1. Masuk ke folder proyek
cd projects/todolist-rest-api

# 2. Jalankan server
node app.mjs

# 3. Server aktif di port 3000!
# Gunakan berkas test.http (ekstensi REST Client di VS Code) atau curl untuk menguji request.
```

---

## 🧭 Navigasi

- ⬅️ **Kembali ke Modul Database:** [06 - Modern Database Persistence with Prisma ORM](../06-database-prisma/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)

