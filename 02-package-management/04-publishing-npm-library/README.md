# 04 - Membangun & Publikasi Library NPM

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Merancang modul JavaScript modular yang siap didistribusikan ke publik atau privat NPM Registry sehingga dapat dipasang via `npm install` oleh pengembang di seluruh dunia.
> - **Kapan Digunakan**: Digunakan saat ingin berbagi pustaka utilitas bersama (_shared internal utility_), komponen SDK kustom, atau pustaka open-source buatan Anda sendiri.
> - **Aturan Praktis**: Gunakan berkas `.npmignore` untuk mencegah berkas uji coba internal, source rahasia, atau log (`*.log`) ikut terunggah ke registri publik. Gunakan bidang `"exports"` di `package.json` untuk mendukung subpath impor modular (misal: `my-lib/number`).

---

## 1. 🎯 Tujuan Belajar

- Memahami arsitektur paket library modular modern: struktur `exports` root (`.`) dan subpath (`./number`).
- Mengonfigurasi berkas `.npmignore` agar paket yang diunggah ke registry berukuran seringan mungkin.
- Melakukan otentikasi akun NPM CLI menggunakan `npm login`.
- Memahami prosedur penentuan nomor rilis dan perintah publikasi `npm publish`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan mempublikasikan library ke NPM seperti **merilis produk bumbu masakan kemasan ke supermarket**:
>
> - **Kode sumber lokal** adalah **dapur pabrik Anda**: di sana ada resep rahasia, catatan uji rasa, dan tempat sampah dapur.
> - **`.npmignore`** adalah **penyortir kemasan**: memastikan hanya bumbu jadi yang higienis yang dimasukkan ke dalam kardus, sedangkan catatan kotor dan sampah log dapur tidak ikut terkirim ke supermarket.
> - **`npm publish`** adalah **truk distributor**: membawa kardus bumbu Anda ke rak supermarket global (NPM Registry) di mana jutaan koki lain bisa mengambil dan memakainya.

---

### Struktur File Library yang Baik

```text
my-library/
├── .npmignore          # Berkas yang TIDAK BOLEH ikut diunggah (log, test, build script)
├── package.json        # Manifes modul & pemetaan ekspor
├── index.js            # Entrypoint utama modul (root export)
├── number.js           # Sub-modul spesifik (subpath export)
└── README.md           # Panduan cara pakai untuk pengguna paket
```

---

### Konfigurasi Kunci `package.json` untuk Subpath Export

```json
{
  "name": "nodejs-npm-library-codesann",
  "version": "1.1.0",
  "type": "module",
  "exports": {
    ".": "./index.js",
    "./number": "./number.js"
  }
}
```

Dengan konfigurasi di atas, pengguna library Anda dapat mengimpor fungsi dengan dua cara:
1. `import { sayHello, sum } from 'nodejs-npm-library-codesann';`
2. `import { min, max } from 'nodejs-npm-library-codesann/number';`

---

## 3. 💻 Kode Praktik Terpadu

Berkas praktik pada subtopik ini:
- [`package.json`](package.json): Konfigurasi manifes library dengan konfigurasi dual-export (`.` dan `./number`).
- [`index.js`](index.js): Modul entrypoint utama berisi fungsi `sayHello` dan `sum`.
- [`number.js`](number.js): Sub-modul numerik berisi fungsi pencari nilai minimum (`min`) dan maksimum (`max`).
- [`.npmignore`](.npmignore): Aturan pengabaian berkas log saat dipublikasikan.

Jalankan pengujian fungsi library lokal secara langsung:

```bash
# Menguji fungsi entrypoint utama
node -e "import('./02-package-management/04-publishing-npm-library/index.js').then(m => console.log(m.sum([10, 20, 30])))"

# Menguji fungsi sub-modul number
node -e "import('./02-package-management/04-publishing-npm-library/number.js').then(m => console.log('Min:', m.min(5, 12), 'Max:', m.max(5, 12)))"
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Langkah Publikasi ke NPM Registry

Berikut adalah urutan langkah resmi merilis library baru:

```bash
# 1. Login ke akun NPM Anda melalui terminal
npm login

# 2. Pastikan tes berhasil dan naikkan versi SemVer
npm version minor   # Contoh: 1.0.0 -> 1.1.0

# 3. Publikasikan ke registry publik
npm publish --access public
```

### ⚠️ Common Pitfalls

- **Lupa Menambahkan `.npmignore`**: Jika proyek tidak memiliki `.npmignore` dan `.gitignore`, seluruh berkas termasuk berkas konfigurasi lokal dan password `.env` bisa tanpa sengaja terunggah ke NPM publik.
- **Nama Paket Sudah Digunakan Orang Lain**: NPM tidak mengizinkan dua paket memiliki nama yang sama persis. Gunakan scoped package (misalnya `@username/nama-paket`) jika nama yang diinginkan sudah dipakai orang lain.

### 🌟 Best Practice

- **Uji Paket Sebelum Publish via `npm pack`**: Perintah `npm pack` akan membuat arsip `.tgz` persis seperti apa yang akan diunggah ke NPM. Anda bisa mengecek isi arsip tersebut terlebih dahulu untuk memastikan tidak ada file liar yang terbawa.

---

## 5. ✍️ Latihan Mandiri

1. Tambahkan fungsi baru `multiply(numbers)` di dalam `index.js` yang menghitung hasil perkalian seluruh angka dalam sebuah array.
2. Jalankan perintah `npm pack` di folder ini dan periksa berkas tarball yang dihasilkan menggunakan perintah `tar -tf *.tgz`.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [03 - Menggunakan Third-Party Packages](../03-third-party-packages/README.md)
- ➡️ **Selanjutnya:** [03 - Node.js Unit Testing with Jest](../../03-unit-test/README.md)
- 🏠 **Daftar Isi Modul 02:** [README Modul 02](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

