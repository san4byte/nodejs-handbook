# 01 - Jest Basics & Matchers

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menyusun blok pengujian unit menggunakan fungsi `test()` atau `it()` serta memvalidasi hasil ekspektasi nilai menggunakan assertions (_Matchers_) bawaan Jest.
> - **Kapan Digunakan**: Digunakan untuk setiap fungsi, utilitas, atau logika bisnis yang membutuhkan jaminan kebenaran output (mencegah regresi bug di masa depan).
> - **Aturan Praktis**: Gunakan `toBe()` untuk membandingkan nilai primitif (angka, boolean, string via `===`), dan gunakan `toEqual()` untuk membandingkan kesamaan struktur mendalam Objek atau Array secara rekursif (_Deep Equality_).

---

## 1. 🎯 Tujuan Belajar

- Memahami struktur deklarasi pengujian: fungsi `test('deskripsi', () => {})` dan aliasnya `it()`.
- Menguasai perbedaan mutlak antara pembanding referensi primitif `toBe()` vs kesamaan struktur objek `toEqual()`.
- Menggunakan Matchers khusus:
  - Truthiness: `toBeNull()`, `toBeUndefined()`, `toBeDefined()`, `toBeTruthy()`, `toBeFalsy()`.
  - Numbers: `toBeGreaterThan()`, `toBeGreaterThanOrEqual()`, `toBeLessThan()`, `toBeCloseTo()`.
  - Strings: `toMatch()` berbasis Regular Expression.
  - Arrays: `toContain()`, `toContainEqual()`.
- Membalikkan kondisi evaluasi matcher menggunakan modifier negasi `.not`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Matchers Jest seperti **pemeriksaan mutu (Quality Control) di pabrik smartphone**:
>
> - **`toBe()`** ibarat **memeriksa nomor seri IMEI identik**: benda tersebut harus merupakan unit fisik yang sama persis (`Object.is`).
> - **`toEqual()`** ibarat **memeriksa dua kotak smartphone baru**: meskipun nomor seri fisiknya berbeda, jika spesifikasi RAM, warna, dan aksesoris di dalam kedua kotak identik sama persis, produk dinyatakan lolos uji QC.
> - **`.not`** ibarat **instruksi inspeksi terbalik**: memastikan layar handphone _tidak boleh_ retak (`expect(layar).not.toBe('retak')`).

---

### Tabel Matchers Populer Jest

| Matcher | Kapan Digunakan? | Contoh Kode |
| :--- | :--- | :--- |
| `toBe(val)` | Membandingkan nilai primitif (`===`) | `expect(1 + 1).toBe(2)` |
| `toEqual(obj)` | Membandingkan isi Objek/Array secara rekursif | `expect({ a: 1 }).toEqual({ a: 1 })` |
| `toBeNull()` | Memastikan nilai tepat `null` | `expect(data).toBeNull()` |
| `toBeTruthy()` | Memastikan nilai bernilai truthy | `expect('hello').toBeTruthy()` |
| `toBeFalsy()` | Memastikan nilai bernilai falsy (`0`, `""`, `false`) | `expect(0).toBeFalsy()` |
| `toBeGreaterThan(n)` | Angka lebih besar dari `n` | `expect(10).toBeGreaterThan(5)` |
| `toMatch(regex)` | String cocok dengan pola Regex | `expect('joko@mail.com').toMatch(/@mail\.com$/)` |
| `toContain(item)` | Array atau string memuat elemen tertentu | `expect(['apple', 'banana']).toContain('apple')` |
| `.not.matcher()` | Membalikkan hasil evaluasi | `expect(status).not.toBe('ERROR')` |

---

### Pembahasan Mendalam Fitur

#### 1. Perbedaan Mendasar `toBe` vs `toEqual`

```javascript
const person1 = { name: 'Joko' };
const person2 = { name: 'Joko' };

// GAGAL! Karena person1 dan person2 adalah dua instance objek berbeda di RAM:
// expect(person1).toBe(person2);

// BERHASIL! Karena struktur dan nilai properti di dalamnya sama persis:
expect(person1).toEqual(person2);
```

#### 2. Assertion String & Array

```javascript
// Pengujian string dengan Regex
expect('Node.js Backend Developer').toMatch(/Backend/);

// Pengujian elemen array
const techStack = ['JavaScript', 'Node.js', 'Express', 'Prisma'];
expect(techStack).toContain('Node.js');
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`sum.test.js`](../test/sum.test.js): Pengujian fungsi penjumlahan dan array reduce.
- [`equel.test.js`](../test/equel.test.js): Pembuktian perbedaan `toBe` vs `toEqual`.
- [`truthiness.test.js`](../test/truthiness.test.js): Pengujian nilai null, undefined, truthy, dan falsy.
- [`number.test.js`](../test/number.test.js): Assertion komparasi angka (`toBeGreaterThan`, dll).
- [`string.test.js`](../test/string.test.js): Assertion pencocokan pola regex string.
- [`array.test.js`](../test/array.test.js): Assertion koleksi array (`toContain`, `toContainEqual`).
- [`not.test.js`](../test/not.test.js): Penggunaan modifier negasi `.not`.
- [`it.test.js`](../test/it.test.js): Penggunaan kata kunci alternatif `it()`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 03-unit-test
npm test -- test/sum.test.js
npm test -- test/equel.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Memvalidasi Payload Return API

Memastikan fungsi transformasi data mengembalikan struktur objek yang sesuai dengan kontrak API:

```javascript
test('fungsi formatUserProfile harus mengembalikan profil yang disanitasi', () => {
  const rawDbUser = { id: 1, passwordHash: 'secret_hash', name: 'Joko', role: 'admin' };
  const result = sanitizeUser(rawDbUser);

  expect(result).toEqual({ id: 1, name: 'Joko', role: 'admin' });
  expect(result.passwordHash).toBeUndefined();
});
```

### ⚠️ Common Pitfalls

- **Menggunakan `toBe()` pada Objek atau Array**: Menggunakan `toBe({ a: 1 })` akan selalu gagal meskipun isinya identik. Selalu gunakan `toEqual()` untuk tipe referensi.
- **Menggunakan `toBe()` untuk Angka Pecahan (Floating Point)**: Karena presisi binary floating point JavaScript (`0.1 + 0.2 === 0.30000000000000004`), gunakan selalu `expect(0.1 + 0.2).toBeCloseTo(0.3)`.

### 🌟 Best Practice

- **Tulis Deskripsi Test yang Jelas**: Tulis nama test dengan pola behavior-driven: `test('harus mengembalikan 400 jika email tidak valid', () => {})`.

---

## 5. ✍️ Latihan Mandiri

1. Tulis fungsi `isAdult(age)` di file sumber Anda yang mengembalikan boolean `true` jika usia $\ge 18$.
2. Buat berkas test baru dan ujilah fungsi tersebut menggunakan matchers `toBeTruthy()`, `toBeFalsy()`, dan `.not.toBe()`.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [04 - Membangun & Publikasi Library NPM](../../02-package-management/04-publishing-npm-library/README.md)
- ➡️ **Selanjutnya:** [02 - Exception & Asynchronous Testing](../02-exceptions-and-async-test/README.md)
- 🏠 **Daftar Isi Modul 03:** [README Modul 03](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

