# 02 - Semantic Versioning & Dependencies Rule

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Memahami aturan format penomoran versi resmi **Semantic Versioning (SemVer)** `MAJOR.MINOR.PATCH` serta aturan resolusi tanda operator prefix (`^`, `~`, `*`, exact) dalam berkas `package.json`.
> - **Kapan Digunakan**: Digunakan saat menginstal pustaka eksternal, memperbarui paket, mengunci versi di `package-lock.json`, atau menentukan nomor rilis untuk modul buatan sendiri.
> - **Aturan Praktis**: Tanda caret (`^`) mengizinkan update non-breaking (MINOR & PATCH), tilde (`~`) hanya mengizinkan perbaikan bug (PATCH), sedangkan tanpa tanda (`exact`) mengunci versi secara kaku. Jangan pernah menaruh testing library di `dependencies`, taruh selalu di `devDependencies`.

---

## 1. 🎯 Tujuan Belajar

- Menguasai 3 komponen angka SemVer: **MAJOR** (perubahan breaking), **MINOR** (fitur baru kompatibel), dan **PATCH** (perbaikan bug).
- Mengetahui cara kerja operator versi NPM: `^`, `~`, `>`, `<`, dan `*`.
- Memahami peran krusial `package-lock.json` dalam menjamin konsistensi instalasi dependensi di mesin developer lain dan server CI/CD.
- Membedakan kategori dependensi: `dependencies` vs `devDependencies` vs `peerDependencies`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan nomor versi SemVer seperti **versi model mobil**:
>
> - **PATCH (`1.0.1` -> `1.0.2`)**: Penggantian baut atau oli mesin yang bocor. Pengemudi tidak merasakan perbedaan apa pun pada cara mengemudi mobil.
> - **MINOR (`1.0.2` -> `1.1.0`)**: Penambahan fitur baru seperti kamera mundur dan sensor parkir. Mobil tetap berfungsi seperti biasa, namun kini ada fitur tambahan yang menyenangkan tanpa merusak fitur lama.
> - **MAJOR (`1.1.0` -> `2.0.0`)**: Penggantian total mesin bensin menjadi mobil listrik berbasis baterai tanpa pedal kopling. Pengemudi harus mempelajari cara baru mengoperasikannya karena sistem lama sudah tidak kompatibel (_breaking changes_).

---

### Format Resmi Semantic Versioning (SemVer)

$$\text{Format: } \mathbf{MAJOR}.\mathbf{MINOR}.\mathbf{PATCH}$$

| Elemen | Kapan Angka Naik? | Dampak Terhadap Pengguna |
| :--- | :--- | :--- |
| **MAJOR** | Saat ada perubahan API yang tidak kompatibel mundur (_Breaking Changes_) | Kode lama bisa error jika tidak dimodifikasi |
| **MINOR** | Saat ada fungsi atau fitur baru yang tetap kompatibel mundur | Aman di-update, kode lama tetap berjalan lancar |
| **PATCH** | Saat ada perbaikan bug atau tambalan celah keamanan (_Bug Fixes_) | Sangat aman di-update secara berkala |

---

### Tabel Operator Versi Dependency di `package.json`

| Format di `package.json` | Operator | Versi yang Diizinkan Diunduh oleh NPM |
| :--- | :--- | :--- |
| `"express": "^4.18.2"` | Caret (`^`) | `>= 4.18.2` dan `< 5.0.0` (Hanya MINOR dan PATCH yang naik) |
| `"express": "~4.18.2"` | Tilde (`~`) | `>= 4.18.2` dan `< 4.19.0` (Hanya PATCH yang naik) |
| `"express": "4.18.2"` | Exact (Tepat) | Hanya versi `4.18.2` persis, tidak akan pernah berubah |
| `"express": "*"` | Wildcard | Mengambil versi paling mutakhir apa pun, termasuk MAJOR breaking |

---

### Perbedaan `dependencies` vs `devDependencies`

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "prisma": "^5.12.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^9.0.0"
  }
}
```

- **`dependencies`**: Pustaka yang **wajib ada** agar aplikasi backend dapat berjalan di server produksi (contoh: framework web, driver database).
- **`devDependencies`**: Alat bantu yang **hanya dibutuhkan saat proses pengembangan** di laptop developer (contoh: unit test framework, linter, TypeScript compiler). Di server production, instalasi dapat dilakukan dengan perintah hemat `npm install --omit=dev`.

---

## 3. 💻 Kode Praktik Terpadu

Berkas rujukan pada subtopik ini:
- [`dependency-version.md`](dependency-version.md): Catatan intisari semantic versioning resmi.

Cek status versi dependensi yang terpasang di proyek Anda secara langsung:

```bash
# Menampilkan pohon dependensi yang terpasang
npm list --depth=0

# Memeriksa dependensi yang sudah memiliki versi lebih baru
npm outdated
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menjaga Stabilitas Server Produksi via `npm ci`

Di server production atau pipeline GitHub Actions, jangan pernah menggunakan `npm install`. Gunakan selalu:

```bash
npm ci
```

Perintah `npm ci` (_Clean Install_) membaca secara kaku dari `package-lock.json` tanpa mencoba memperbarui versi dependensi apa pun, sehingga hasil build di server 100% identik dengan apa yang diuji oleh programmer.

### ⚠️ Common Pitfalls

- **Mengabaikan Berkas `package-lock.json`**: Menghapus `package-lock.json` atau memasukkannya ke `.gitignore` adalah kesalahan fatal. Hal ini dapat membuat versi sub-dependensi di server production berbeda dari komputer lokal dan menimbulkan bug misterius.
- **Menggunakan Operator Wildcard `*`**: Menyimpan dependensi dengan versi `*` akan membuat aplikasi otomatis menarik rilis baru yang mungkin membawa _breaking changes_ mendadak di tengah malam.

### 🌟 Best Practice

- **Gunakan Caret (`^`) sebagai Standar**: Caret adalah pilihan default terbaik yang diberikan NPM saat `npm install <pkg>`, karena memberikan perbaikan bug dan fitur baru secara aman tanpa merusak kode Anda.

---

## 5. ✍️ Latihan Mandiri

1. Jika sebuah paket tertulis `"lodash": "^4.17.21"`, apakah NPM akan mengunduh versi `4.18.0` jika tersedia? Apakah NPM akan mengunduh `5.0.0`?
2. Buka berkas `package-lock.json` di proyek Anda dan amati bagaimana setiap paket dikunci dengan URL tarball dan hash integritas SHA-512 yang presisi.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [01 - Package JSON & Scripts Automation](../01-package-json-and-scripts/README.md)
- ➡️ **Selanjutnya:** [03 - Menggunakan Third-Party Packages](../03-third-party-packages/README.md)
- 🏠 **Daftar Isi Modul 02:** [README Modul 02](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

