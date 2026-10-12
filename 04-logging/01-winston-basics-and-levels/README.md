# 01 - Winston Basics & Log Levels

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menggantikan `console.log()` standar dengan library logger profesional, mengelompokkan pesan berdasarkan tingkat keparahan (_Severity Levels_), dan memfilter pesan yang dicetak berdasarkan level lingkungan aplikasi.
> - **Kapan Digunakan**: Wajib digunakan di seluruh aplikasi backend Node.js production untuk membedakan pesan debug saat development dan pesan error saat server hidup di cloud.
> - **Aturan Praktis**: Di mode development, set level ke `debug` atau `silly`. Di server production, set level ke `info` atau `warn` agar log tidak membanjiri hard disk.

---

## 1. 🎯 Tujuan Belajar

- Memahami kelemahan fatal `console.log()` di production: tidak memiliki level prioritas, tidak ada timestamp standar, dan tidak mendukung multi-tujuan (file, ELK stack, Datadog).
- Membuat instance logger menggunakan `winston.createLogger({ level, transports })`.
- Menguasai standar RFC5424 Log Levels: `error`, `warn`, `info`, `http`, `verbose`, `debug`, dan `silly`.
- Memahami hierarki ambang batas: level yang dipilih akan mencatat pesan di levelnya dan seluruh level yang lebih kritis di atasnya.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Log Levels seperti **sistem sirene peringatan di rumah sakit**:
>
> - **`silly` / `debug` (Suara Bisikan)**: Perawat mencatat bahwa sprei kasur baru diganti. Informasi detail tapi tidak mendesak.
> - **`info` (Lampu Hijau Nyala)**: Pasien baru saja check-in di loket pendaftaran.
> - **`warn` (Lampu Kuning Berkedip)**: Tabung oksigen tinggal tersisa 15%. Belum ada yang celaka, tapi butuh perhatian segera.
> - **`error` (Sirene Darurat Meraung)**: Terjadi henti jantung pada pasien di ruang ICU! Seluruh dokter harus segera bertindak.

---

### Hierarki Angka Prioritas RFC5424 Winston

Semakin kecil angka prioritas, semakin gawat tingkat keparahannya:

```text
0: error    🚨 (Paling Kritis)
1: warn     ⚠️
2: info     ℹ️
3: http     🌐
4: verbose  📝
5: debug    🐞
6: silly    🎈 (Paling Rinci)
```

Jika Anda menyetel `level: 'info'`, maka Winston **hanya akan mencatat**: `error`, `warn`, dan `info`. Pesan bertipe `debug` dan `silly` akan otomatis disaring dan diabaikan!

---

### Pembahasan Mendalam Fitur

#### Inisialisasi Logger Sederhana

```javascript
import winston from "winston";

const logger = winston.createLogger({
  level: "info", // Ambang batas minimum
  transports: [new winston.transports.Console()],
});

// Pesan-pesan ini akan tampil di terminal:
logger.error("Koneksi basis data terputus!");
logger.warn("Kapasitas disk tersisa 10%");
logger.info("Server HTTP mendengarkan di port 3000");

// Pesan ini DIABAIKAN karena prioritas debug (5) lebih rendah dari info (2):
logger.debug("Menjalankan kalkulasi loop internal");
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:

- [`logger.test.js`](../test/logger.test.js) (test case `'create logger'`): Inisialisasi logger dengan level `debug` dan output ke konsol.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 04-logging
npm test -- -t "create logger"
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menyetel Level Dinamis Berdasarkan `NODE_ENV`

```javascript
import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
  level: isProduction ? "warn" : "debug",
  transports: [new winston.transports.Console()],
});
```

### ⚠️ Common Pitfalls

- **Menulis Pesan Rahasia di Log Level `info`**: Mencetak password user, kartu kredit, atau JWT secret di log aplikasi. Selalu lakukan sanitasi data sensitif sebelum dioper ke logger.
- **Membiarkan Log Level `debug` di Server Produksi**: Menghasilkan jutaan baris log per jam yang menghabiskan kuota disk server dan membuat biaya monitoring membengkak.

### 🌟 Best Practice

- **Gunakan Log Terstruktur (JSON)**: Jangan hanya mencetak string biasa; kirimkan objek metadata konteks (`logger.info('User login', { userId: 42, ip: '1.2.3.4' })`) agar mudah di-query di Elasticsearch atau CloudWatch.

---

## 5. ✍️ Latihan Mandiri

1. Buat instance logger dengan ambang batas `level: 'warn'`.
2. Panggil secara berurutan `logger.error()`, `logger.warn()`, `logger.info()`, dan `logger.debug()`. Catat log mana saja yang benar-benar tercetak di layar.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [05 - Mocking & Spying](../../03-unit-test/05-mocking/README.md)
- ➡️ **Selanjutnya:** [02 - Transports & Log Formatting](../02-transports-and-formats/README.md)
- 🏠 **Daftar Isi Modul 04:** [README Modul 04](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)
