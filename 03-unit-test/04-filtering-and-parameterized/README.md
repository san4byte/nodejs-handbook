# 04 - Test Filtering & Parameterized Testing

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mengontrol alur eksekusi pengujian dengan memfokuskan atau melompati test tertentu (`test.only`, `test.skip`, `test.todo`), menguji variasi input menggunakan tabel parameter (`test.each`), dan mempercepat eksekusi via pengujian paralel (`test.concurrent`).
> - **Kapan Digunakan**: Gunakan `test.only` saat fokus debugging satu test spesifik. Gunakan `test.each` saat menguji puluhan kombinasi input dan output (matematika, rumus diskon, validasi form) agar tidak menulis kode duplikat.
> - **Aturan Praktis**: Jangan pernah meninggalkan `test.only` di branch utama atau commit git, karena akan menyebabkan test-test lainnya diabaikan oleh pipeline CI/CD.

---

## 1. 🎯 Tujuan Belajar

- Mengisolasi eksekusi test yang sedang dikerjakan dengan `test.only()`.
- Menonaktifkan sementara pengujian yang bermasalah menggunakan `test.skip()`.
- Merencanakan daftar pengujian yang belum diimplementasikan dengan penanda `test.todo()`.
- Mengimplementasikan **Data-Driven Testing** menggunakan tabel parameter array 2D dan tagged template `test.each`.
- Memanfaatkan eksekusi test paralel non-blocking menggunakan `test.concurrent`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Parameterized Testing seperti **alat uji kelayakan charger smartphone**:
>
> - Alih-alih Anda membeli 5 alat uji terpisah untuk menguji charger terhadap daya 5 Watt, 10 Watt, 15 Watt, 20 Watt, dan 65 Watt...
> - Anda cukup membuat **satu soket uji pintar** yang dialiri daftar arus listrik berbeda secara bergiliran (`test.each`).
> - Hasilnya dilaporkan satu per satu secara rapi dalam satu layar laporan pengujian.

---

### Tabel Fitur Filtering & Parameterized Jest

| Fitur | Kegunaan | Contoh Sintaks |
| :--- | :--- | :--- |
| `test.only(name, fn)` | Hanya menjalankan test ini saja dalam file | `test.only('fokus test ini', () => {})` |
| `test.skip(name, fn)` | Melompati eksekusi test ini | `test.skip('lewati sementara', () => {})` |
| `test.todo(name)` | Placeholder pengingat test yang belum dibuat | `test.todo('fitur kalkulasi pajak')` |
| `test.each(table)(name, fn)` | Menjalankan test berulang kali dengan data berbeda | `test.each([[1, 1, 2], [2, 3, 5]])(...)` |
| `test.concurrent(...)` | Menjalankan pengujian secara paralel simultan | `test.concurrent('test cepat', async () => {})` |

---

### Pembahasan Mendalam Fitur

#### 1. Data-Driven Testing dengan `test.each` (Array Table)

```javascript
import { sumAll } from '../src/sum';

// Tabel: [ [inputArray, expectedOutput] ]
const cases = [
  [[], 0],
  [[5], 5],
  [[10, 20], 30],
  [[1, 2, 3, 4], 10],
];

test.each(cases)('sumAll(%j) harus menghasilkan %i', (input, expected) => {
  expect(sumAll(input)).toBe(expected);
});
```

#### 2. Parameterized Testing Berbasis Objek

```javascript
const userRoles = [
  { role: 'admin', canDelete: true },
  { role: 'editor', canDelete: false },
  { role: 'viewer', canDelete: false },
];

test.each(userRoles)('Role $role apakah bisa hapus data: $canDelete', ({ role, canDelete }) => {
  expect(checkPermission(role).canDelete).toBe(canDelete);
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`only.test.js`](../test/only.test.js): Isolasi eksekusi satu test terpilih.
- [`skip.test.js`](../test/skip.test.js): Melompati test tertentu.
- [`todo.test.js`](../test/todo.test.js): Pembuatan placeholder daftar to-do pengujian.
- [`each.test.js`](../test/each.test.js): Implementasi parameterized testing berbasis array tabel.
- [`each-object.test.js`](../test/each-object.test.js): Parameterized testing menggunakan objek template literal.
- [`concurrent.test.js`](../test/concurrent.test.js): Pengujian konkuren paralel simultan.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 03-unit-test
npm test -- test/each.test.js
npm test -- test/concurrent.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menguji Validasi Format Nomor Telepon Internasional

Menguji puluhan variasi nomor telepon (dengan kode negara `+62`, format `08`, ada spasi, tanpa strip) ke dalam satu fungsi `validatePhoneNumber` tanpa menulis fungsi test berulang-ulang:

```javascript
test.each([
  ['+628123456789', true],
  ['08123456789', true],
  ['abc0812345', false],
  ['123', false],
])('Validasi nomor telepon %s harus menghasilkan %s', (phone, expected) => {
  expect(isValidPhone(phone)).toBe(expected);
});
```

### ⚠️ Common Pitfalls

- **Lupa Menghapus `test.only` Sebelum Pull Request**: Jest akan mengabaikan ratusan test lain dan hanya menjalankan satu test tersebut, sehingga pipeline CI tampak sukses padahal ada bug regresi di modul lain.
- **Race Condition pada `test.concurrent`**: Jika test paralel memodifikasi variabel global yang sama secara bersamaan, hasilnya akan menjadi fluktuatif dan tidak terprediksi.

### 🌟 Best Practice

- **Gunakan Format Judul Placeholder `%s`, `%i`, `$variable`**: Judul test yang deskriptif pada `test.each` memudahkan Anda mengidentifikasi baris data mana yang menyebabkan kegagalan jika ada salah satu kasus uji yang error.

---

## 5. ✍️ Latihan Mandiri

1. Buat fungsi `hitungDiskon(harga, persen)` dan uji dengan `test.each` untuk 4 kombinasi input: diskon 0%, diskon 50%, diskon 100%, dan harga negatif.
2. Gunakan `test.todo` untuk mencatat 3 skenario edge case yang perlu diuji di masa mendatang.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [03 - Scoping, Setup & Teardown Lifecycle](../03-setup-and-teardown/README.md)
- ➡️ **Selanjutnya:** [05 - Mocking & Spying](../05-mocking/README.md)
- 🏠 **Daftar Isi Modul 03:** [README Modul 03](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

