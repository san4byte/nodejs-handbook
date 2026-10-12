# 01 - Package JSON & Scripts Automation

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mendefinisikan identitas proyek Node.js melalui manifes `package.json`, mendaftarkan titik masuk berkas (_entrypoint_), mengelola tipe sistem modul (`"type": "module"`), dan mengotomatiskan alur kerja terminal via bagian `"scripts"`.
> - **Kapan Digunakan**: Wajib ada di setiap proyek Node.js modern skala apa pun, baik aplikasi backend maupun library publik.
> - **Aturan Praktis**: Manfaatkan hook otomatis `pre<script>` dan `post<script>` untuk menjalankan tugas pembersihan, linting, atau kompilasi sebelum dan sesudah skrip utama dieksekusi.

---

## 1. 🎯 Tujuan Belajar

- Memahami anatomi dan bidang esensial pada `package.json`: `name`, `version`, `main`, `exports`, `scripts`, `dependencies`, dan `type`.
- Mengonfigurasi proyek agar menggunakan standar ECMAScript Modules (`"type": "module"`).
- Mendefinisikan automasi skrip CLI: `npm run dev`, `npm start`, `npm test`.
- Memahami siklus lifecycle scripts otomatis NPM (`prestart` -> `start` -> `poststart`).

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan `package.json` seperti **KTP dan buku manual operasional sebuah mesin pabrik**:
>
> - Memuat identitas resmi (nama pabrik, versi produksi, nama pemilik/penulis).
> - Bagian `"scripts"` ibarat **tombol panel operasi pabrik**: alih-alih operator harus menyalakan 10 kabel secara manual setiap pagi, operator cukup menekan satu tombol berlabel `START`, dan sistem secara otomatis mengeksekusi urutan langkah pemanasan mesin (`prestart`), operasional utama (`start`), dan pendinginan (`poststart`).

---

### Struktur Kunci `package.json`

| Kunci / Properti | Tipe Data | Deskripsi & Contoh |
| :--- | :--- | :--- |
| `"name"` | `string` | Nama unik paket (huruf kecil, tanpa spasi, dipisahkan tanda strip) |
| `"version"` | `string` | Nomor versi SemVer saat ini (contoh: `"1.0.0"`) |
| `"type"` | `string` | `"module"` untuk ES Modules (`import`), `"commonjs"` untuk CJS (`require`) |
| `"exports"` | `object` | Mendefinisikan subpath import publik dan menyembunyikan berkas internal |
| `"scripts"` | `object` | Perintah shell yang dapat dieksekusi melalui `npm run <nama>` |

---

### Pembahasan Mendalam Lifecycle Scripts NPM

NPM memiliki fitur otomatis di mana perintah yang diawali `pre` akan dieksekusi **sebelum** perintah target, dan perintah berawalan `post` akan dieksekusi **setelah** perintah target selesai:

```json
"scripts": {
  "prestart": "echo 'Pemanasan dan cek koneksi database...'",
  "start": "node index.js",
  "poststart": "echo 'Aplikasi berhasil ditutup.'"
}
```

Ketika Anda menjalankan:
```bash
npm start
```
Urutan yang dieksekusi oleh NPM adalah:
1. `echo 'Pemanasan dan cek koneksi database...'`
2. `node index.js`
3. `echo 'Aplikasi berhasil ditutup.'`

---

## 3. 💻 Kode Praktik Terpadu

Berkas praktik pada subtopik ini:
- [`index.js`](index.js): File eksekusi utama yang memanggil utilitas modul lokal dan menuliskan catatan ke log.
- [`write.js`](write.js): Modul utilitas lokal yang mengekspor fungsi `writeToFile`.
- [`export.js`](export.js): File demonstrasi alternatif untuk penulisan log.
- [`data/hello.log`](data/hello.log): Berkas log hasil eksekusi skrip.

Jalankan demonstrasi secara langsung di terminal Anda:

```bash
# Eksekusi langsung via node
node 02-package-management/01-package-json-and-scripts/index.js

# Atau eksekusi dari root folder modul 02 menggunakan NPM script
cd 02-package-management
npm run start
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Automasi Skrip Linter & Database Migration

```json
"scripts": {
  "migrate": "prisma migrate deploy",
  "lint": "eslint . --fix",
  "prebuild": "npm run lint",
  "build": "vite build",
  "postbuild": "echo 'Build berhasil dan siap deploy ke server!'"
}
```

### ⚠️ Common Pitfalls

- **Menambahkan Spasi atau Huruf Kapital pada `"name"`**: Nama paket di NPM dilarang mengandung spasi atau huruf kapital. Gunakan format kebab-case seperti `my-awesome-api`.
- **Tidak Menyertakan `"type": "module"`**: Tanpa konfigurasi ini, Node.js menganggap semua file `.js` sebagai CommonJS, sehingga perintah `import / export` akan menghasilkan `SyntaxError: Cannot use import statement outside a module`.

### 🌟 Best Practice

- **Gunakan Bidang `"exports"` Modern**: Hindari mengandalkan `"main"` lama saja jika proyek memiliki banyak modul pendukung. Bidang `"exports"` memungkinkan Anda mengatur enkapsulasi direktori dengan melarang klien mengimpor file internal secara liar.

---

## 5. ✍️ Latihan Mandiri

1. Tambahkan skrip custom bernama `"format"` di `package.json` yang mencetak pesan teks `"Memformat kode dengan rapi..."` ke terminal.
2. Pasang hook `"preformat"` dan buktikan di terminal bahwa pesan pra-eksekusi selalu tampil lebih dulu saat `npm run format` dijalankan.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [22 - Console & Custom Stream Logging](../../01-core-modules/22-console/README.md)
- ➡️ **Selanjutnya:** [02 - Semantic Versioning & Dependencies Rule](../02-dependencies-and-versioning/README.md)
- 🏠 **Daftar Isi Modul 02:** [README Modul 02](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

