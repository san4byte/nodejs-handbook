# 03 - Menggunakan Third-Party Packages

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Memanfaatkan ribuan pustaka siap pakai yang dibuat oleh komunitas open-source global di [NPM Registry](https://www.npmjs.com) untuk mempercepat siklus pembuatan aplikasi.
> - **Kapan Digunakan**: Digunakan saat membutuhkan fungsionalitas umum yang kompleks daripada menulis dari nol (misalnya manipulasi struktur koleksi data kompleks via `lodash`, parsing tanggal via `date-fns` atau `moment`, token JWT, dll).
> - **Aturan Praktis**: Periksa selalu reputasi paket sebelum memasangnya (jumlah download mingguan, update terakhir, ukuran bundle, dan audit celah keamanan `npm audit`).

---

## 1. 🎯 Tujuan Belajar

- Menguasai perintah instalasi paket: `npm install <package-name>` dan flag `--save-dev`.
- Mengimpor pustaka pihak ketiga ke dalam format modern ES Modules (`import ... from '...'`).
- Memahami bagaimana Node.js mencari lokasi modul di direktori bertingkat `node_modules/`.
- Memeriksa kerentanan keamanan pustaka dengan perintah `npm audit`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan membangun rumah menggunakan paket NPM seperti **merakit furnitur dari IKEA**:
>
> - Anda tidak perlu menebang pohon, memotong kayu, dan menghaluskan permukaan meja sendiri dari nol (menulis seluruh kode utilitas sendiri).
> - Anda cukup memesan modul meja yang sudah teruji kekuatannya dari katalog terpercaya (`npm install lodash`).
> - Anda tinggal membuka paket tersebut di ruang tamu Anda dan memasangnya dengan baut standar yang sudah disediakan.

---

### Alur Resolusi Modul Node.js

Ketika Anda menulis `import _ from 'lodash'`, Node.js melakukan pencarian lokasi secara bertahap:
1. Memeriksa apakah `lodash` merupakan modul bawaan Node.js (Core Module) — _Bukan_.
2. Mencari folder `./node_modules/lodash/` di direktori saat ini.
3. Jika tidak ditemukan, naik satu tingkat ke `../node_modules/lodash/` hingga mencapai root sistem.
4. Membaca berkas `package.json` milik `lodash` untuk mengetahui berkas entrypoint utama yang harus dimuat.

---

### Pembahasan Praktik Menggunakan Pustaka Populer

#### 1. Manipulasi String & Koleksi dengan `lodash`

```javascript
import _ from 'lodash';

const rawName = 'joko santoso backend developer';

// Mengubah menjadi Title Case
console.log(_.startCase(rawName)); // 'Joko Santoso Backend Developer'

// Mengubah menjadi UPPERCASE
console.log(_.upperCase(rawName)); // 'JOKO SANTOSO BACKEND DEVELOPER'

// Mengambil nilai unik dari array
console.log(_.uniq([1, 2, 2, 3, 4, 4, 5])); // [1, 2, 3, 4, 5]
```

#### 2. Format Waktu dengan `moment`

```javascript
import moment from 'moment';

const now = moment().format('YYYY-MM-DD HH:mm:ss');
console.log('Waktu saat ini:', now);
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas praktik pada subtopik ini:
- [`lodash.js`](lodash.js): Demonstrasi pemanggilan fungsi manipulasi huruf kapital `_.upperCase()`.
- [`moment.js`](moment.js): Demonstrasi pemformatan tanggal dan waktu modern.
- [`package-library.js`](package-library.js): Demonstrasi konsumsi library buatan sendiri yang dipasang dari NPM.

Jalankan demonstrasi secara langsung di terminal Anda:

```bash
# Menjalankan demonstrasi lodash
node 02-package-management/03-third-party-packages/lodash.js

# Menjalankan demonstrasi moment
node 02-package-management/03-third-party-packages/moment.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menjaga Keamanan Dependensi dengan `npm audit`

Di industri, ketergantungan terhadap ratusan paket pihak ketiga rentan terhadap serangan _Supply Chain Attack_. Rutin jalankan audit keamanan:

```bash
# Memindai laporan kerentanan keamanan CVE
npm audit

# Memperbarui otomatis paket rentan ke versi yang aman
npm audit fix
```

### ⚠️ Common Pitfalls

- **Meng-commit Folder `node_modules/` ke Git**: Folder `node_modules` dapat berukuran ratusan MB. Selalu pastikan `node_modules/` tertulis di berkas `.gitignore`. Siapa pun yang men-clone repositori Anda cukup menjalankan `npm install`.
- **Memasang Paket yang Sudah Tidak Aktif Dirawat (Abandoned)**: Menggunakan paket yang belum diupdate selama bertahun-tahun berisiko tinggi memiliki celah keamanan yang tidak tertambal.

### 🌟 Best Practice

- **Gunakan Tree Shaking Jika Memungkinkan**: Jika hanya membutuhkan satu fungsi, impor fungsi secara spesifik agar tidak memuat seluruh pustaka ke dalam memori aplikasi.

---

## 5. ✍️ Latihan Mandiri

1. Pasang paket `uuid` menggunakan perintah `npm install uuid`. Buat skrip yang menghasilkan 5 nomor ID unik acak versi 4 (`uuidv4()`).
2. Gunakan `npm audit` untuk memastikan seluruh paket di modul ini bersih dari kerentanan kritis.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [02 - Semantic Versioning & Dependencies Rule](../02-dependencies-and-versioning/README.md)
- ➡️ **Selanjutnya:** [04 - Membangun & Publikasi Library NPM](../04-publishing-npm-library/README.md)
- 🏠 **Daftar Isi Modul 02:** [README Modul 02](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

