# 02 - Transports & Log Formatting

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menentukan ke mana data log dialirkan (_Transports_) dan bagaimana bentuk visual pesan tersebut disusun (_Formats_) seperti format JSON, penambahan stempel waktu ISO, pewarnaan ANSI di terminal, atau template string custom.
> - **Kapan Digunakan**: Digunakan untuk membuat log yang mudah dibaca oleh mata manusia saat di terminal lokal (`colorize()`, `printf()`), sekaligus ramah mesin (_Machine-Readable_) saat di server cloud (`json()`, `timestamp()`).
> - **Aturan Praktis**: Gunakan `winston.format.combine()` untuk menggabungkan beberapa formatur sekaligus (misal: menambahkan stempel waktu kemudian mengubahnya menjadi representasi JSON).

---

## 1. 🎯 Tujuan Belajar

- Memahami konsep **Transport**: target media penyimpanan log (Console, File, HTTP endpoint, database).
- Menguasai formatur bawaan Winston: `format.json()`, `format.timestamp()`, `format.colorize()`, `format.simple()`, dan `format.prettyPrint()`.
- Menggabungkan beberapa formatur menggunakan `format.combine()`.
- Membuat tata letak teks kustom dengan formatur `format.printf((info) => {})`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Transports dan Formats seperti **proses penerbitan surat kabar harian**:
>
> - **Formats** adalah **desainer tata letak percetakan**: bertugas mengatur font, memberi stempel tanggal cetak, dan menyusun kolom berita agar seragam dan estetik.
> - **Transports** adalah **saluran distribusi surat kabar**: koran yang sama dapat dikirimkan ke kios koran jalanan (Console), diarsipkan ke perpustakaan daerah (File), atau diunggah ke portal berita online (Cloud Log Collector).

---

### Daftar Formatur Populer Winston

| Formatur | Hasil Keluaran / Kegunaan |
| :--- | :--- |
| `format.timestamp()` | Menyisipkan properti `timestamp` (misal: `2026-10-10T11:00:00.000Z`) ke objek log |
| `format.json()` | Mengonversi seluruh entri log dan metadatanya menjadi satu baris string JSON valid |
| `format.colorize()` | Memberi warna ANSI pada teks (merah untuk error, kuning untuk warn, hijau untuk info) |
| `format.printf(fn)` | Mengizinkan Anda merangkai string keluaran kustom menggunakan template literal |
| `format.combine(...)` | Mengaitkan beberapa middleware formatur menjadi satu rantai eksekusi |

---

### Pembahasan Mendalam Fitur

#### 1. Kombinasi Timestamp & JSON

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

logger.info('Pengguna berhasil melakukan login');
// Output: {"level":"info","message":"Pengguna berhasil melakukan login","timestamp":"2026-10-10T11:00:00.000Z"}
```

#### 2. Kustomisasi Format Ramah Mata Manusia (`printf`)

```javascript
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

const devLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`logger.test.js`](../test/logger.test.js) (test case `'format logger'`): Demonstrasi `winston.format.combine()` dengan `timestamp()` dan `json()`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 04-logging
npm test -- -t "format logger"
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Standar Logging Microservices Modern

Dalam arsitektur microservices berbasis Kubernetes dan ELK Stack (Elasticsearch, Logstash, Kibana), setiap service wajib memancarkan log berformat JSON satu baris (_ndjson_) ke `stdout`:

```javascript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Otomatis menyertakan stack trace error
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-service', version: '1.2.0' },
  transports: [new winston.transports.Console()]
});
```

### ⚠️ Common Pitfalls

- **Menyertakan `format.colorize()` Saat Menulis ke File**: Warna terminal dihasilkan melalui karakter escape ANSI (`\u001b[31m`). Jika disimpan ke berkas log fisik, teks akan menjadi kotor dan sulit di-parse oleh parser log.
- **Urutan `combine()` Terbalik**: Meletakkan formatur di urutan yang salah (misal meletakkan `colorize()` setelah `json()`) dapat menghilangkan efek warna atau merusak format JSON.

### 🌟 Best Practice

- **Pemisahan Konfigurasi Lingkungan**: Gunakan format warna warni teks (`printf`) hanya saat `NODE_ENV !== 'production'`. Gunakan format `json()` murni saat di production.

---

## 5. ✍️ Latihan Mandiri

1. Buat formatter `printf` yang menghasilkan format: `YYYY-MM-DD | SEVERITY | Pesan Anda`.
2. Ujilah logger tersebut untuk mencetak pesan error dan amati hasilnya di terminal.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [01 - Winston Basics & Log Levels](../01-winston-basics-and-levels/README.md)
- ➡️ **Selanjutnya:** [03 - File Transport & Daily Rotate Log](../03-file-and-daily-rotate/README.md)
- 🏠 **Daftar Isi Modul 04:** [README Modul 04](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

