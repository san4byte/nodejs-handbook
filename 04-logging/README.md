# 📘 Modul 04: Production Logging with Winston

Selamat datang di **Modul 04**! Modul ini membahas secara mendalam praktik observabilitas dan sistem pencatatan jejak aplikasi (_Application Logging_) tingkat produksi di Node.js menggunakan **Winston** dan **Winston Daily Rotate File**.

---

## 📚 Daftar Materi Pembelajaran

1. [01 - Winston Basics & Log Levels](01-winston-basics-and-levels/README.md)
   - Mengapa `console.log` tidak layak untuk produksi, inisialisasi instance logger, dan standar RFC5424 tingkat keparahan log level.
2. [02 - Transports & Log Formatting](02-transports-and-formats/README.md)
   - Media output (_Transports_), pemformatan pesan (`json`, `timestamp`, `colorize`, `printf`), dan penggabungan format via `combine`.
3. [03 - File Transport & Daily Rotate Log](03-file-and-daily-rotate/README.md)
   - Penulisan log ke berkas fisik, pemisahan berkas error (`transport-error.log`), dan rotasi berkas otomatis per hari untuk mencegah kehabisan kapasitas disk.
4. [04 - Exception & Rejection Handlers](04-exception-and-rejections/README.md)
   - Menangkap otomatis galat fatal yang lolos (`uncaughtException` & `unhandledRejection`) langsung ke berkas log audit terpisah.

---

## 🛠️ Cara Menjalankan

Masuk ke direktori modul ini, pasang dependensi, lalu jalankan test suite pengujian logger:

```bash
cd 04-logging
npm install

# Menjalankan test pengujian logger
npm test

# Menjalankan penangkapan exception otomatis
node src/logging-exception.js
node src/logging-rejections.js
```

---

## 🧭 Navigasi

- ⬅️ **Modul Sebelumnya:** [03 - Node.js Unit Testing with Jest](../03-unit-test/README.md)
- ➡️ **Modul Selanjutnya:** [05 - Schema Data Validation with Joi](../05-validation/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)
