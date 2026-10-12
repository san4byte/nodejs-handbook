# 📘 Modul 03: Node.js Unit Testing with Jest

Selamat datang di **Modul 03**! Modul ini membahas secara mendalam otomasi pengujian perangkat lunak (_Automated Unit Testing_) di lingkungan Node.js menggunakan framework industri terpopuler, **Jest**, dengan dukungan transpilasi ES Modules via **Babel**.

---

## 📚 Daftar Materi Pembelajaran

1. [01 - Jest Basics & Matchers](01-jest-basics-and-matchers/README.md)
   - Struktur pengujian `describe`/`test`/`it`, equality matchers (`toBe`, `toEqual`), truthiness, numbers, strings, arrays, dan negasi `.not`.
2. [02 - Exception & Asynchronous Testing](02-exceptions-and-async-test/README.md)
   - Pengujian fungsi yang melempar error (`toThrow`), pengujian Promise, `async/await`, dan skenario kegagalan terencana (`test.failing`).
3. [03 - Scoping, Setup & Teardown Lifecycle](03-setup-and-teardown/README.md)
   - Lifecycle hook: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`, serta pewarisan isolasi cakupan blok `describe`.
4. [04 - Test Filtering & Parameterized Testing](04-filtering-and-parameterized/README.md)
   - Filter eksekusi test (`test.only`, `test.skip`, `test.todo`), pengujian berbasis tabel parameter (`test.each`), dan pengujian paralel (`test.concurrent`).
5. [05 - Mocking & Spying](05-mocking/README.md)
   - Isolasi dependensi dengan `jest.fn()`, verifikasi pemanggilan fungsi (`toHaveBeenCalled`), mock implementation, dan mock return value.

---

## 🛠️ Cara Menjalankan

Masuk ke direktori modul ini, pasang dependensi, lalu jalankan test runner:

```bash
cd 03-unit-test
npm install

# Menjalankan seluruh test suite dengan laporan coverage:
npm test

# Menjalankan spesifik test file:
npm test -- test/sum.test.js
npm test -- test/async.test.js
npm test -- test/mock-function.test.js
```

---

## 🧭 Navigasi

- ⬅️ **Modul Sebelumnya:** [02 - Package Management & Library Ecosystem](../02-package-management/README.md)
- ➡️ **Modul Selanjutnya:** [04 - Production Logging with Winston](../04-logging/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)

