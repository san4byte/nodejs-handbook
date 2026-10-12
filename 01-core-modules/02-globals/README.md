# Globals

> Ringkasan
> - Fungsi: Menyediakan objek, fungsi utilitas, dan antarmuka Web API standar yang dapat diakses di seluruh cakupan kode tanpa deklarasi impor.
> - Digunakan saat: Mengelola antrean tugas mikro asinkron, mengkloning data berstruktur dalam, mengukur latensi eksekusi presisi tinggi, dan mengonversi format teks biner.
> - Aturan praktis: Hindari menambahkan properti baru ke `globalThis` untuk mencegah tabrakan nama dan kebocoran memori; gunakan `queueMicrotask()` untuk penjadwalan fungsi mendesak sebelum siklus macrotask.

---

## Tujuan Belajar

- Mengidentifikasi objek global bawaan Node.js dan standar Web API universal.
- Membedakan cakupan global (`globalThis`) dengan cakupan berkas terisolasi pada modul ES.
- Menerapkan fungsi `structuredClone()` untuk menduplikasi struktur data kompleks secara mandiri.
- Mengukur durasi performa komputasi berpresisi tinggi menggunakan `performance.now()`.
- Mengonversi representasi string teks menjadi byte array menggunakan `TextEncoder` dan `TextDecoder`.
- Mengendalikan prioritas eksekusi kode asinkron dengan `queueMicrotask()` dan pembatalan operasi melalui `AbortController`.

---

## Konsep

> Runtime Node.js dapat dianalogikan sebagai gedung kantor bersama (_co-working space_). Cakupan `globalThis` adalah lobi umum beserta fasilitas publiknya (jam dinding, dispenser, dan meja informasi) yang bebas digunakan seluruh penghuni gedung tanpa kunci akses khusus. Setiap berkas kode adalah meja kerja pribadi dengan laci terkunci (_module scope_). Menyimpan dokumen rahasia di atas meja lobi publik berisiko menimbulkan tertukarnya dokumen antar-divisi dan kebocoran informasi.

```mermaid
flowchart TD
    GT["globalThis (Cakupan Publik)"] --> CORE["Node.js Core (Buffer, process, console)"]
    GT --> WEB["Standar Web (fetch, TextEncoder, URL, structuredClone)"]
    GT --> TIMERS["Penjadwalan Waktu (setTimeout, setImmediate, queueMicrotask)"]
    GT --> ES["Tipe ECMAScript (Promise, Map, Set, JSON, Error)"]
```

---

## Referensi

| Item | Fungsi | Catatan |
| :--- | :--- | :--- |
| **`globalThis`** | Mengakses objek akar cakupan global lintas platform secara konsisten | Menggantikan referensi `global` pada Node.js dan `window` pada peramban |
| **`structuredClone()`** | Membuat salinan mendalam (_deep clone_) dari suatu nilai JavaScript | Mendukung tipe bawaan seperti Date, Map, Set, dan referensi melingkar |
| **`performance.now()`** | Menghasilkan stempel waktu resolusi tinggi dalam satuan milidetik | Bersifat monotonik sehingga kebal terhadap koreksi jam sistem operasi |
| **`TextEncoder`** | Mengodekan string karakter menjadi deretan biner `Uint8Array` berbasis UTF-8 | Standar universal untuk manipulasi payload biner dan kriptografi |
| **`TextDecoder`** | Menerjemahkan deretan byte `Uint8Array` kembali menjadi string teks UTF-8 | Menangani karakter multibyte dan emoji secara akurat |
| **`queueMicrotask()`** | Memasukkan fungsi panggilan balik ke antrean tugas mikro (_microtask queue_) | Dieksekusi sebelum macrotask berikutnya tanpa beban alokasi Promise |
| **`AbortController`** | Mengirimkan sinyal pembatalan ke operasi asinkron atau pendengar peristiwa | Memiliki properti `signal` untuk memeriksa status pembatalan |

### `globalThis`

`globalThis` adalah objek universal standar ECMAScript yang merujuk pada cakupan terluar runtime. Di Node.js, `globalThis` setara dengan pengenal lama `global`.

```javascript
console.log(globalThis === global);
// Output: true

globalThis.appRegion = 'ID-JKT';
console.log(global.appRegion);
// Output: ID-JKT
```

Kasus lain: Di dalam ES Modules, deklarasi variabel `var` atau `const` tingkat atas tidak secara otomatis terikat pada properti `globalThis`.

```javascript
const localIdentifier = 'secret';
console.log(globalThis.localIdentifier);
// Output: undefined
```

### `structuredClone()`

Fungsi `structuredClone()` digunakan untuk menduplikasi objek secara mendalam tanpa mempertahankan referensi memori pada properti bersarang. Fungsi ini meniadakan kebutuhan pustaka eksternal untuk kloning data.

```javascript
const originalProfile = {
  name: 'Sarah',
  settings: { theme: 'dark', notifications: true },
};

const clonedProfile = structuredClone(originalProfile);
clonedProfile.settings.theme = 'light';

console.log(originalProfile.settings.theme);
// Output: dark
console.log(clonedProfile.settings.theme);
// Output: light
```

Kasus lain: Melempar pengecualian `DataCloneError` saat mencoba menyalin fungsi, simbol, atau objek yang tidak dapat diserialisasi.

```javascript
try {
  structuredClone({ calculate: () => 42 });
} catch (error) {
  console.log(error.name);
  // Output: DataCloneError
}
```

### `performance.now()`

Metode `performance.now()` mengembalikan stempel waktu presisi tinggi dengan fraksi sub-milidetik. Nilainya dihitung relatif terhadap awal inisialisasi runtime sehingga tidak terpengaruh pergeseran waktu jam kalender.

```javascript
const startTime = performance.now();

let total = 0;
for (let i = 0; i < 100_000; i++) {
  total += i;
}

const endTime = performance.now();
const duration = endTime - startTime;

console.log(typeof duration);
// Output: number
console.log(duration >= 0);
// Output: true
```

Kasus lain: Menghitung selisih waktu antara dua pengukuran yang terjadi secara berurutan menghasilkan angka positif atau nol yang konsisten.

```javascript
const timeA = performance.now();
const timeB = performance.now();
console.log(timeB >= timeA);
// Output: true
```

### `TextEncoder`

Kelas `TextEncoder` mengonversi representasi string teks menjadi aliran byte biner dalam format `Uint8Array` dengan penyandian baku UTF-8. Objek ini sangat umum digunakan untuk memproses data sebelum dikirim melalui soket jaringan atau algoritma hashing.

```javascript
const encoder = new TextEncoder();
const encodedBytes = encoder.encode('Node.js');

console.log(encodedBytes instanceof Uint8Array);
// Output: true
console.log(encodedBytes.length);
// Output: 7
```

Kasus lain: Mengodekan karakter simbol multi-byte menghasilkan beberapa byte sekaligus sesuai standar UTF-8.

```javascript
const encoder = new TextEncoder();
const symbolBytes = encoder.encode('€');
console.log(symbolBytes.length);
// Output: 3
```

### `TextDecoder`

Kelas `TextDecoder` membaca deretan byte biner seperti `Uint8Array` atau `Buffer` dan merekonstruksinya kembali menjadi string teks manusia. Objek ini melengkapi operasi `TextEncoder` untuk komunikasi dua arah.

```javascript
const decoder = new TextDecoder('utf-8');
const binaryInput = new Uint8Array([72, 101, 108, 108, 111]);
const decodedText = decoder.decode(binaryInput);

console.log(decodedText);
// Output: Hello
```

Kasus lain: Membaca array byte kosong mengembalikan string kosong tanpa melempar galat.

```javascript
const decoder = new TextDecoder();
const emptyResult = decoder.decode(new Uint8Array([]));
console.log(emptyResult === '');
// Output: true
```

### `queueMicrotask()`

Fungsi `queueMicrotask()` menjadwalkan eksekusi panggilan balik ke dalam antrean tugas mikro (_microtask queue_). Tugas mikro dieksekusi tepat setelah bingkai eksekusi sinkron saat ini kosong dan sebelum perputaran Event Loop berpindah ke macrotask seperti timer.

```javascript
const executionOrder = [];

setTimeout(() => {
  executionOrder.push('timer-macrotask');
}, 0);

queueMicrotask(() => {
  executionOrder.push('microtask');
});

executionOrder.push('sync');

setTimeout(() => {
  console.log(executionOrder.join(' -> '));
  // Output: sync -> microtask -> timer-macrotask
}, 10);
```

Kasus lain: Melempar `TypeError` jika argumen yang diberikan bukan berupa fungsi yang dapat dieksekusi.

```javascript
try {
  queueMicrotask('not-a-function');
} catch (error) {
  console.log(error.name);
  // Output: TypeError
}
```

### `AbortController`

Kelas `AbortController` menyediakan mekanisme standar untuk mengirimkan sinyal pembatalan ke operasi asinkron. Objek pendengar dapat memantau status `signal.aborted` atau mendengarkan peristiwa `abort`.

```javascript
const controller = new AbortController();
const signal = controller.signal;

console.log(signal.aborted);
// Output: false

controller.abort('Operation timed out');

console.log(signal.aborted);
// Output: true
console.log(signal.reason);
// Output: Operation timed out
```

Kasus lain: Memanggil `.abort()` berulang kali tidak mengubah alasan asli yang sudah didaftarkan pertama kali.

```javascript
const controller = new AbortController();
controller.abort('First reason');
controller.abort('Second reason');
console.log(controller.signal.reason);
// Output: First reason
```

### Perbandingan: Penjadwalan Asinkron

| Fitur | Jenis Antrean | Prioritas Relatif | Kebutuhan Alokasi |
| :--- | :--- | :--- | :--- |
| **`queueMicrotask()`** | Microtask Queue | Setelah blok sinkron, sebelum Macrotask | Ringan (tanpa objek Promise baru) |
| **`setTimeout(fn, 0)`** | Macrotask Queue (Timer) | Setelah seluruh Microtask rampung | Memerlukan registrasi slot timer di Libuv |
| **`Promise.resolve().then(fn)`** | Microtask Queue | Setara dengan `queueMicrotask()` | Membentuk instance Promise tambahan di memori |

---

## Kesalahan Umum

### Mengotori `globalThis` untuk Menyimpan State Aplikasi

Menyimpan state atau variabel konfigurasi pada `globalThis` membuat dependensi tersembunyi, mempersulit pengujian unit, dan rentan terhadap tabrakan nama antar-pustaka.

```javascript
// Salah
globalThis.currentUser = { id: 101, name: 'Alice' };
```

```javascript
// Benar
// Simpan di dalam modul tersendiri lalu ekspor secara eksplisit
export const currentUser = { id: 101, name: 'Alice' };
```

### Menggunakan `JSON.parse(JSON.stringify())` untuk Deep Clone

Metode serialisasi JSON menghilangkan properti bertipe `undefined`, simbol, serta mengubah objek `Date` menjadi string biasa tanpa mempertahankan tipe aslinya.

```javascript
// Salah
const copiedData = JSON.parse(
  JSON.stringify({ timestamp: new Date(), payload: undefined }),
);
console.log(typeof copiedData.timestamp); // string (kehilangan objek Date)
console.log('payload' in copiedData); // false (properti lenyap)
```

```javascript
// Benar
const copiedData = structuredClone({ timestamp: new Date(), payload: undefined });
console.log(copiedData.timestamp instanceof Date); // true
console.log('payload' in copiedData); // true
```

### Mengakses Variabel Pseudo-Global CommonJS pada ES Modules

Memanggil variabel lingkungan CommonJS seperti `__dirname` atau `__filename` di dalam berkas modul standar ES memicu pengecualian fatal karena variabel tersebut tidak didaftarkan di lingkungan ESM.

```javascript
// Salah
const currentDirectory = __dirname;
```

```javascript
// Benar
import { fileURLToPath } from 'node:url';
const currentDirectory = fileURLToPath(new URL('.', import.meta.url));
```

---

## Studi Kasus

Skenario: Membangun dispatcher tugas terenkapsulasi yang mengukur latensi pemrosesan data, mengonversi payload string menjadi biner, memvalidasi pembatalan tugas via `AbortController`, dan memastikan isolasi salinan data menggunakan `structuredClone`.

```javascript
class TaskDispatcher {
  process(inputData, options = {}) {
    const startTime = performance.now();

    if (options.signal?.aborted) {
      return {
        success: false,
        reason: options.signal.reason,
        durationMs: 0,
      };
    }

    const isolatedData = structuredClone(inputData);
    isolatedData.status = 'PROCESSED';

    const encoder = new TextEncoder();
    const serializedPayload = JSON.stringify(isolatedData);
    const binaryPayload = encoder.encode(serializedPayload);

    const endTime = performance.now();

    return {
      success: true,
      byteLength: binaryPayload.byteLength,
      data: isolatedData,
      durationMs: Number((endTime - startTime).toFixed(4)),
    };
  }
}

const dispatcher = new TaskDispatcher();
const controller = new AbortController();

const normalResult = dispatcher.process(
  { id: 1, item: 'Book' },
  { signal: controller.signal },
);
console.log(normalResult.success);
// Output: true
console.log(normalResult.data.status);
// Output: PROCESSED
console.log(normalResult.byteLength > 0);
// Output: true

controller.abort('Operation cancelled by system');
const abortedResult = dispatcher.process(
  { id: 2, item: 'Pen' },
  { signal: controller.signal },
);
console.log(abortedResult.success);
// Output: false
console.log(abortedResult.reason);
// Output: Operation cancelled by system
```

Desain ini memanfaatkan fitur global murni (`structuredClone`, `performance.now`, `TextEncoder`, `AbortController`) untuk menjamin keamanan mutasi data dan memberikan observabilitas eksekusi tanpa memerlukan dependensi pihak ketiga.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `getUtf8ByteLength(text)` yang menerima sebuah string teks dan mengembalikan jumlah byte biner yang dihasilkan setelah dikodekan menggunakan `TextEncoder`.

Contoh masukan:
```javascript
getUtf8ByteLength('Hello Node.js');
```

Contoh keluaran yang diharapkan:
```javascript
13
```

Batasan: Gunakan kelas `TextEncoder` bawaan global tanpa menghitung panjang karakter string secara manual dengan `.length`.

### Soal 2 (Menengah)

Buat fungsi `cloneAndMeasure(targetObject)` yang menerima sebuah objek bertingkat. Fungsi ini wajib membuat salinan mendalam dari objek target menggunakan `structuredClone()`, menambahkan properti baru `clonedAt` bertipe objek `Date`, serta menyisipkan properti `durationMs` yang menghitung waktu proses kloning dalam satuan milidetik menggunakan `performance.now()`.

Contoh masukan:
```javascript
cloneAndMeasure({ module: 'Globals', version: 1 });
```

Contoh keluaran yang diharapkan:
```javascript
{
  module: 'Globals',
  version: 1,
  clonedAt: 2026-10-12T00:00:00.000Z, // Instance objek Date
  durationMs: 0.045 // Bilangan positif
}
```

Batasan: Objek asli tidak boleh mengalami mutasi. Wajib menggunakan `structuredClone()` dan `performance.now()`.

### Soal 3 (Menantang)

Buat fungsi penjadwal antrean batch `scheduleMicroBatch(payloads, byteLimit, signal)` yang memproses serangkaian payload teks. Fungsi harus mematuhi aturan berikut:

1. Setiap payload diubah menjadi biner `Uint8Array` menggunakan `TextEncoder`.
2. Jika akumulasi ukuran byte biner pada batch yang sedang diproses melebihi nilai `byteLimit`, proses harus dihentikan dan kembalikan galat operasional `{ success: false, reason: 'Byte quota exceeded' }`.
3. Sebelum memproses tiap item, periksa apakah `signal.aborted` bernilai `true`. Jika dibatalkan, hentikan iterasi dan kembalikan `{ success: false, reason: signal.reason }`.
4. Jika seluruh payload valid, kembalikan objek `{ success: true, totalBytes: number, binaries: Uint8Array[] }`. Seluruh komputasi harus dijalankan di dalam pembungkus fungsi mikro berbasis `queueMicrotask()` yang mengembalikan Promise hasil akhir.

Contoh masukan 1:
```javascript
const controller = new AbortController();
await scheduleMicroBatch(['alpha', 'beta'], 50, controller.signal);
```

Contoh keluaran 1:
```javascript
{
  success: true,
  totalBytes: 9,
  binaries: [
    Uint8Array(5) [ 97, 108, 112, 104, 97 ],
    Uint8Array(4) [ 98, 101, 116, 97 ]
  ]
}
```

Contoh masukan 2:
```javascript
const controller = new AbortController();
await scheduleMicroBatch(
  ['very long payload exceeding byte quota limit'],
  10,
  controller.signal,
);
```

Contoh keluaran 2:
```javascript
{
  success: false,
  reason: 'Byte quota exceeded'
}
```

Contoh masukan 3:
```javascript
const controller = new AbortController();
controller.abort('Cancelled by user');
await scheduleMicroBatch(['data'], 100, controller.signal);
```

Contoh keluaran 3:
```javascript
{
  success: false,
  reason: 'Cancelled by user'
}
```

Batasan: Dilarang menggunakan pustaka eksternal. Wajib mengombinasikan `queueMicrotask`, `TextEncoder`, dan `AbortSignal` dengan penanganan kasus pembatalan dan batasan kuota.

---

## Navigasi

[Sebelumnya: Standard Library](../01-standard-library/README.md) | [Selanjutnya: Process](../03-process/README.md) | [Daftar Isi](../README.md)
