# Debugger

> Ringkasan
>
> - Fungsi: Menghentikan sementara alur eksekusi program pada titik tertentu, memeriksa nilai variabel secara langsung, dan menelusuri kode baris demi baris menggunakan protokol V8 Inspector.
> - Digunakan saat: Menyelidiki error logika rumit yang sulit dilacak hanya dengan logging biasa, menganalisis kebocoran memori, atau melakukan profiling performa CPU.
> - Aturan praktis: Jangan pernah membuka port debugger ke alamat publik (`0.0.0.0`) karena protokol V8 Inspector tidak memiliki otentikasi bawaan dan membuka celah eksekusi kode berbahaya dari jarak jauh (_Remote Code Execution_).

---

## Tujuan Belajar

- Menempatkan titik henti terprogram di dalam kode JavaScript menggunakan pernyataan `debugger;`.
- Mengendalikan sesi penelusuran baris demi baris di terminal via utilitas bawaan `node inspect`.
- Menghubungkan proses Node.js ke antarmuka inspeksi visual seperti Chrome DevTools dan VS Code.
- Mengontrol siklus hidup listener V8 Inspector secara terprogram melalui modul `node:inspector`.
- Mengamankan konfigurasi port debugging pada lingkungan server.

---

## Konsep

Debugger bisa kita bayangkan seperti tombol jeda (_pause_) dan rekaman gerak lambat pada siaran pertandingan olahraga. Saat pertandingan berlangsung secara langsung di lapangan, pergerakan bola dan pemain terlalu cepat untuk memastikan apakah terjadi pelanggaran atau tidak (_kode berjalan normal tanpa henti_).

Menggunakan **Debugger** sama seperti menekan tombol **Pause** tepat di detik benturan terjadi (_breakpoint_). Wasit peninjau VAR dapat memajukan video frame demi frame (_step over_), berganti sudut pandang kamera untuk melihat posisi setiap pemain (_inspeksi variabel_), mendengarkan percakapan mikrofon wasit utama (_step into_), lalu menekan tombol Play untuk melanjutkan kembali pertandingan (_resume_).

```mermaid
flowchart LR
    NODE["Runtime Node.js (V8 Engine)"] <-->|V8 Inspector Protocol (WebSocket)| CLIENT["Klien Debugger (Chrome DevTools / VS Code / node inspect)"]
    NODE --> BP["Titik Henti: debugger; / Breakpoint UI"]
    CLIENT --> CMD["Kontrol Navigasi: Step Over, Step Into, Resume, REPL"]
```

---

## Referensi

| Item                              | Fungsi                                                               | Catatan                                                              |
| :-------------------------------- | :------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **`debugger;`**                   | Menandai titik henti eksekusi di dalam kode JavaScript               | Diabaikan oleh runtime jika program dijalankan tanpa mode inspect    |
| **`node inspect`**                | Membuka CLI debugger interaktif bawaan Node.js di terminal           | Menyediakan perintah navigasi teks seperti `c`, `n`, `s`, dan `repl` |
| **`--inspect`**                   | Mengaktifkan port listener protokol V8 Inspector                     | Secara bawaan mendengarkan pada alamat lokal `127.0.0.1:9229`        |
| **`--inspect-brk`**               | Mengaktifkan V8 Inspector dan menahan proses di baris pertama kode   | Menunggu klien debugger terhubung sebelum mengeksekusi baris awal    |
| **`inspector.open()`**            | Membuka port listener V8 Inspector langsung dari kode JavaScript     | Berguna untuk mengaktifkan sesi debugging saat mendeteksi anomali    |
| **`inspector.close()`**           | Menutup port listener V8 Inspector dan memutuskan koneksi aktif      | Mengamankan kembali port jaringan setelah sesi diagnostik selesai    |
| **`inspector.url()`**             | Mengembalikan alamat URL WebSocket dari listener debugger yang aktif | Bernilai `undefined` jika listener debugger sedang tidak aktif       |
| **`inspector.waitForDebugger()`** | Menghentikan eksekusi sementara hingga klien debugger terhubung      | Menjamin instruksi penting tidak dijalankan sebelum debugger siap    |
| **`inspector.Session`**           | Membuat koneksi terprogram ke Chrome DevTools Protocol (CDP)         | Memungkinkan profiling CPU dan snapshot memori secara mandiri        |

### `debugger;`

Pernyataan `debugger;` menginstruksikan mesin V8 untuk menghentikan sementara jalannya kode saat sesi debugging sedang aktif. Jika program dijalankan secara biasa (`node file.js`), pernyataan ini akan dilewati begitu saja tanpa menimbulkan error.

```javascript
function calculateTotalPrice(unitPrice, quantity) {
  const subtotal = unitPrice * quantity;

  // Titik henti terprogram
  debugger;

  const tax = subtotal * 0.11;
  return subtotal + tax;
}

const total = calculateTotalPrice(25000, 4);
console.log(total);
// Output: 111000
```

Kasus lain: Memasang beberapa pernyataan `debugger;` untuk menginspeksi nilai variabel pada setiap putaran perulangan.

```javascript
let accumulator = 0;
for (let i = 1; i <= 3; i++) {
  accumulator += i;
  debugger; // Berhenti pada setiap putaran loop
}

console.log(accumulator);
// Output: 6
```

### `node inspect`

Perintah terminal `node inspect` menjalankan aplikasi di bawah antarmuka debugging interaktif berbasis teks langsung di command line.

```bash
# Menjalankan berkas di bawah debugger terminal
node inspect app.js
```

Di dalam antarmuka debugger terminal, perintah navigasi utama meliputi:

| Perintah   | Kepanjangan       | Fungsi                                                         |
| :--------- | :---------------- | :------------------------------------------------------------- |
| **`c`**    | _cont / continue_ | Melanjutkan eksekusi hingga breakpoint berikutnya              |
| **`n`**    | _next_            | Melangkah ke baris kode berikutnya (_Step Over_)               |
| **`s`**    | _step_            | Masuk ke dalam fungsi yang dipanggil (_Step Into_)             |
| **`o`**    | _out_             | Melangkah keluar dari fungsi saat ini (_Step Out_)             |
| **`repl`** | _eval_            | Membuka shell evaluasi interaktif untuk memeriksa isi variabel |

Kasus lain: Mengetikkan `watch('variableName')` di sesi `node inspect` untuk memantau perubahan nilai variabel secara otomatis di setiap langkah.

### `--inspect`

Flag baris perintah `--inspect` memerintahkan Node.js untuk membuka port listener WebSocket protokol V8 Inspector (secara default pada `127.0.0.1:9229`) tanpa menghentikan jalannya kode.

```bash
# Membuka port listener debugger pada alamat localhost bawaan
node --inspect server.js
```

Program akan langsung berjalan normal. Kita bisa membuka browser Google Chrome pada URL `chrome://inspect`, lalu memilih target Node.js yang muncul untuk membuka antarmuka visual DevTools.

Kasus lain: Menentukan alamat IP dan port kustom secara eksplisit untuk mencegah benturan port dengan proses lain.

```bash
node --inspect=127.0.0.1:9330 server.js
```

### `--inspect-brk`

Flag `--inspect-brk` membuka listener V8 Inspector dan langsung menahan jalannya aplikasi tepat pada baris kode paling pertama, menunggu klien debugger tersambung sebelum melanjutkan eksekusi.

```bash
# Berhenti di baris pertama menunggu klien terhubung
node --inspect-brk migration-script.js
```

Opsi ini sangat bermanfaat ketika kita ingin menelusuri bug yang terjadi saat proses startup atau inisialisasi awal modul yang berjalan sangat cepat.

Kasus lain: Menggabungkan `--inspect-brk` dengan nomor port kustom saat menjalankan pengujian.

```bash
node --inspect-brk=127.0.0.1:9440 migration-script.js
```

### `inspector.open()`

Fungsi `inspector.open()` dari modul bawaan `node:inspector` membuka port listener debugger langsung dari kode JavaScript tanpa memerlukan flag tambahan saat menjalankan perintah node.

```javascript
import inspector from "node:inspector";

// Buka listener debugger pada port acak lokal yang tersedia
inspector.open(0, "127.0.0.1");

const debuggerUrl = inspector.url();
console.log(typeof debuggerUrl);
// Output: string

inspector.close();
```

Kasus lain: Mengisi nilai `false` pada parameter ketiga agar tidak menahan jalannya proses aplikasi.

```javascript
import inspector from "node:inspector";

// inspector.open(port, host, wait)
inspector.open(0, "127.0.0.1", false);
inspector.close();

console.log(inspector.url());
// Output: undefined
```

### `inspector.close()`

Fungsi `inspector.close()` menonaktifkan listener V8 Inspector dan memutuskan seluruh koneksi klien yang terhubung, mengembalikan aplikasi ke status kerja normal tanpa debugging.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
console.log(typeof inspector.url());
// Output: string

inspector.close();
console.log(inspector.url());
// Output: undefined
```

Kasus lain: Memanggil `inspector.close()` saat listener memang sedang tidak berjalan tetap aman dan tidak akan memicu error.

```javascript
import inspector from "node:inspector";

inspector.close();
console.log(inspector.url());
// Output: undefined
```

### `inspector.url()`

Fungsi `inspector.url()` mengembalikan alamat endpoint WebSocket dari listener V8 Inspector yang sedang aktif, atau bernilai `undefined` jika tidak ada sesi debugger yang menyala.

```javascript
import inspector from "node:inspector";

console.log(inspector.url());
// Output: undefined

inspector.open(0, "127.0.0.1");
console.log(inspector.url().startsWith("ws://127.0.0.1:"));
// Output: true

inspector.close();
```

Kasus lain: Mengambil ID unik UUID sesi debugging yang tertera di bagian akhir alamat WebSocket.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
const address = inspector.url();
const sessionId = address.split("/").pop();

console.log(sessionId.length === 36);
// Output: true

inspector.close();
```

### `inspector.waitForDebugger()`

Fungsi `inspector.waitForDebugger()` menghentikan sementara jalannya thread utama Node.js sampai ada klien luar (seperti VS Code atau Chrome DevTools) yang berhasil tersambung ke port listener WebSocket.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
console.log(typeof inspector.waitForDebugger);
// Output: function

inspector.close();
```

Kasus lain: Memanggil `waitForDebugger()` saat listener belum dibuka dengan `inspector.open()` tidak akan berpengaruh apa pun pada jalannya thread.

```javascript
import inspector from "node:inspector";

inspector.waitForDebugger();
console.log(inspector.url());
// Output: undefined
```

### `inspector.Session`

Kelas `inspector.Session` menyediakan jembatan komunikasi langsung ke Chrome DevTools Protocol (CDP) dari dalam kode JavaScript, memungkinkan kita merekam profil performa CPU tanpa perlu membuka port jaringan keluar.

```javascript
import inspector from "node:inspector";

const session = new inspector.Session();
session.connect();

let isConnected = false;
session.post("Runtime.enable", () => {
  isConnected = true;
});

session.disconnect();
console.log(typeof session.post);
// Output: function
```

Kasus lain: Menangkap error saat mengirimkan perintah CDP yang tidak dikenali oleh protokol V8.

```javascript
import inspector from "node:inspector";

const session = new inspector.Session();
session.connect();

session.post("NonExistentDomain.command", (error) => {
  console.log(error !== null);
  // Output: true
});

session.disconnect();
```

### Perbandingan: `--inspect` vs `--inspect-brk`

| Karakteristik            | `--inspect`                                                             | `--inspect-brk`                                                              |
| :----------------------- | :---------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Titik Henti Awal**     | Program langsung berjalan sampai bertemu titik henti `debugger;`        | Program langsung dijeda di baris paling pertama sebelum mengeksekusi apa pun |
| **Kapan Digunakan**      | Memeriksa server yang berjalan normal jangka panjang                    | Menyelidiki error pada inisialisasi awal atau migrasi startup                |
| **Ketergantungan Klien** | Program tetap menyelesaikan tugas meski tidak ada klien yang tersambung | Program menunggu klien terhubung sebelum menjalankan alur kode               |

---

## Kesalahan Umum

### Membuka Port Inspector ke Alamat Jaringan Publik `0.0.0.0`

Menjalankan flag `--inspect=0.0.0.0` di server produksi akan mengekspos port 9229 ke seluruh internet. Karena protokol V8 Inspector tidak memiliki otentikasi kata sandi, siapa pun dapat menyambungkan Chrome DevTools dan menjalankan kode berbahaya dari jarak jauh (_Remote Code Execution_).

```bash
# Salah
node --inspect=0.0.0.0:9229 server.js
```

```bash
# Benar
node --inspect=127.0.0.1:9229 server.js
```

### Meninggalkan Pernyataan `debugger;` di Kode Produksi

Meskipun diabaikan saat berjalan tanpa flag inspect, membiarkan pernyataan `debugger;` di kode produksi melanggar aturan linter (`no-debugger`), membingungkan tim lain, dan berisiko menghentikan proses server mendadak jika sewaktu-waktu server dijalankan dengan flag inspect aktif.

```javascript
// Salah
function processPayment(transaction) {
  debugger; // Tertinggal di kode rilis produksi
  return sendToBank(transaction);
}
```

```javascript
// Benar
function processPayment(transaction) {
  // Bersihkan sebelum kode dirilis ke produksi
  return sendToBank(transaction);
}
```

### Tertukar Antara Perintah Step Over (`n`) dan Step Into (`s`)

Mengetikkan `next` (`n`) saat kursor berada di pemanggilan fungsi sendiri akan melompati isi fungsi tersebut (_Step Over_). Sebaliknya, mengetikkan `step` (`s`) saat memanggil fungsi modul bawaan Node.js justru akan menyeret kita masuk ke ribuan baris kode internal runtime yang rumit.

```javascript
// Salah
// Menggunakan 's' saat kursor berada di fungsi bawaan sistem
fs.readFileSync("data.txt"); // Masuk ke kode internal node:fs
```

```javascript
// Benar
// Gunakan 'n' untuk melewati fungsi library luar, dan 's' khusus untuk menelusuri fungsi buatan sendiri
```

---

## Studi Kasus

Skenario: Membangun mekanisme pengaktifan debugger darurat otomatis (_emergency on-demand debugger activator_). Ketika aplikasi server mendeteksi kegagalan transaksi kritis berulang kali, sistem secara otomatis membuka listener V8 Inspector pada port lokal yang aman, mencatat alamat WebSocket diagnostik, menunggu bantuan teknisi, lalu menutup kembali port tersebut setelah penyelidikan selesai.

```javascript
import inspector from "node:inspector";

class EmergencyDiagnosticSupervisor {
  #failureCount = 0;
  #threshold = 3;
  #isActive = false;

  recordIncident(error) {
    this.#failureCount++;

    if (this.#failureCount >= this.#threshold && !this.#isActive) {
      // Buka debugger secara terprogram hanya pada alamat localhost aman
      inspector.open(0, "127.0.0.1", false);
      this.#isActive = true;

      return {
        isEmergencyMode: true,
        message: "Failure threshold exceeded. Local debugger port opened.",
        inspectionUrl: inspector.url(),
        reason: error.message,
      };
    }

    return {
      isEmergencyMode: false,
      currentFailureCount: this.#failureCount,
    };
  }

  closeEmergencySession() {
    if (this.#isActive) {
      inspector.close();
      this.#isActive = false;
      this.#failureCount = 0;
    }
  }
}

const supervisor = new EmergencyDiagnosticSupervisor();

supervisor.recordIncident(new Error("Transaction timeout 1"));
supervisor.recordIncident(new Error("Transaction timeout 2"));
const criticalStatus = supervisor.recordIncident(
  new Error("Transaction timeout 3"),
);

console.log(criticalStatus.isEmergencyMode);
// Output: true
console.log(typeof criticalStatus.inspectionUrl);
// Output: string

supervisor.closeEmergencySession();
console.log(inspector.url());
// Output: undefined
```

Pola ini mengamankan port debugger hanya pada alamat `127.0.0.1`, mengaktifkan protokol V8 Inspector saat benar-benar dibutuhkan, serta menyediakan metode penutupan bersih agar tidak ada port terbuka yang menggantung tanpa pengawasan.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `calculateShippingFee(weightKg, distanceKm, isExpress)` yang menghitung ongkos kirim (berat dikali 10000, ditambah jarak dikali 2000, dan biaya tambahan kilat 25000 jika `isExpress` bernilai `true`). Tempatkan pernyataan `debugger;` tepat setelah perhitungan biaya dasar dan sebelum kalkulasi biaya kilat. Kembalikan total tarif dalam bentuk angka integer.

Contoh input:

```javascript
calculateShippingFee(2, 10, true);
```

Contoh output yang diharapkan:

```javascript
65000;
```

Batasan: Gunakan pernyataan `debugger;` bawaan di dalam fungsi.

### Soal 2 (Menengah)

Buat fungsi `runWithScopedInspection(operationFn, customPort)` yang membungkus pemanggilan `operationFn()`. Fungsi harus membuka listener V8 Inspector pada alamat lokal `'127.0.0.1'` dan port `customPort` via `inspector.open()`, mengeksekusi `operationFn()`, memvalidasi status keaktifan sesi via `inspector.url()` (disimpan sebagai boolean `wasActive: true` jika URL string aktif tersedia), serta menjamin penutupan listener via `inspector.close()` di dalam blok `finally`.

Contoh input:

```javascript
const task = () => ({ status: "completed", result: 42 });
runWithScopedInspection(task, 0);
```

Contoh output yang diharapkan:

```javascript
{
  success: true,
  data: { status: 'completed', result: 42 },
  wasActive: true
}
```

Batasan: Gunakan modul bawaan `node:inspector` dan struktur penanganan `try...finally`.

### Soal 3 (Menantang)

Buat modul profiler runtime mandiri bernama `captureExecutionProfile(testFn)` yang menggunakan kelas `inspector.Session` untuk berinteraksi langsung dengan Chrome DevTools Protocol tanpa membuka port jaringan TCP.

Ketentuan pemrosesan:

- Buat instance `new inspector.Session()` dan hubungkan menggunakan `session.connect()`.
- Kirim perintah CDP `'Profiler.enable'` untuk mengaktifkan mesin profiler V8.
- Mulai perekaman CPU dengan mengirimkan perintah `'Profiler.start'`.
- Jalankan fungsi `testFn()`.
- Hentikan perekaman CPU menggunakan perintah `'Profiler.stop'` dan tangkap objek profil yang dikembalikan oleh V8.
- Putuskan sesi secara bersih menggunakan `session.disconnect()`.
- Ambil total node call stack fungsi yang terekam (`totalNodes`) dan durasi waktu sampel dalam milidetik (`sampleDurationMs`).
- Kembalikan objek `{ success: true, totalNodes: <number>, sampleDurationMs: <number> }`.

Contoh input:

```javascript
const computeTask = () => {
  let total = 0;
  for (let i = 0; i < 500000; i++) total += i;
  return total;
};

await captureExecutionProfile(computeTask);
```

Contoh output yang diharapkan:

```javascript
{
  success: true,
  totalNodes: 18,
  sampleDurationMs: 33.3
}
```

Batasan: Wajib menggunakan `inspector.Session` bawaan dari `node:inspector` dengan mengubah callback CDP menjadi Promise. Dilarang membuka port jaringan ke luar.

---

## Navigasi

[Sebelumnya: Util](../20-util/README.md) | [Selanjutnya: Console](../22-console/README.md) | [Daftar Isi](../README.md)
