# Events

> Ringkasan
>
> - Fungsi: Membangun arsitektur berbasis peristiwa (_event-driven architecture_) melalui objek yang memancarkan sinyal dan meresponsnya secara terpisah.
> - Digunakan saat: Mengomunikasikan status antar-modul tanpa kopling ketat, menangani notifikasi sistem, pelacakan proses asinkron, dan perancangan pola _observer_.
> - Aturan praktis: Selalu sediakan pendengar untuk event `'error'` guna mencegah proses terhenti paksa, dan bersihkan pendengar yang tidak lagi dipakai agar terhindar dari kebocoran memori.

---

## Tujuan Belajar

- Memahami pola desain _Observer_ yang mendasari modul-modul inti di Node.js.
- Menerapkan pendaftaran dan pelepasan pendengar menggunakan metode `on`, `once`, `off`, dan `removeAllListeners`.
- Memancarkan event beserta data payload secara terstruktur via `emit`.
- Mengendalikan batas maksimum pendengar dan menganalisis potensi kebocoran memori.
- Menangani event khusus `'error'` dan mengintegrasikan event ke dalam alur Promise melalui utilitas `once()`.

---

## Konsep

> Pola `EventEmitter` dianalogikan seperti stasiun pemancar radio dan pesawat penerima. Stasiun radio (`emitter`) menyiarkan sinyal pada frekuensi tertentu (`emit`) tanpa perlu mengetahui siapa saja atau berapa banyak perangkat yang sedang mendengarkan. Pesawat radio pendengar (`listener`) yang menyetel frekuensi yang sama (`on`) akan langsung menerima siaran tersebut dan memproses pesan secara seketika. Jika saluran dimatikan (`off`), penerima tidak lagi memproses sinyal dari frekuensi itu.

```mermaid
flowchart LR
    EMITTER["EventEmitter (Pemancar)"] -- "emit('pesan', payload)" --> BUS["Event Dispatcher"]
    BUS --> L1["Listener 1 (Logging)"]
    BUS --> L2["Listener 2 (Notifikasi)"]
    BUS --> L3["Listener 3 (Audit)"]
```

---

## Referensi

| Item | Fungsi | Catatan |
| :--- | :----- | :------ |
| **`emitter.on()`** | Mendaftarkan fungsi pendengar untuk event tertentu secara persisten | Alias dari metode `addListener()`, dipanggil setiap kali event dipancarkan |
| **`emitter.once()`** | Mendaftarkan pendengar yang hanya dieksekusi satu kali | Otomatis dilepas setelah event pertama kali dipancarkan |
| **`emitter.emit()`** | Memancarkan event dan mengeksekusi pendengar secara sinkron | Mengembalikan nilai boolean `true` jika memiliki pendengar, `false` jika tidak |
| **`emitter.off()`** | Menghapus satu fungsi pendengar tertentu dari antrean event | Alias dari metode `removeListener()`, membutuhkan referensi fungsi yang sama |
| **`emitter.removeAllListeners()`** | Menghapus seluruh pendengar dari suatu event atau semua event | Digunakan saat pembersihan sumber daya sebelum objek dibuang |
| **`emitter.listenerCount()`** | Menghitung jumlah pendengar aktif pada event tertentu | Membantu audit diagnostik dan pemantauan alokasi memori |
| **`emitter.setMaxListeners()`** | Mengatur batas peringatan jumlah pendengar pada satu instance | Nilai bawaan adalah 10 untuk mendeteksi potensi kebocoran memori |
| **`events.once()`** | Mengubah penantian event menjadi Promise yang dapat di-await | Fungsi pembantu statis dari modul `node:events` |

### `emitter.on()`

Metode `emitter.on()` digunakan untuk mendaftarkan fungsi pendengar yang akan terus dijalankan setiap kali event yang ditentukan dipancarkan oleh sistem.

```javascript
import { EventEmitter } from "node:events";

const stasiun = new EventEmitter();
const riwayat = [];

stasiun.on("siaran", (pesan) => {
  riwayat.push(pesan);
});

stasiun.emit("siaran", "Edisi Pagi");
stasiun.emit("siaran", "Edisi Siang");

console.log(riwayat);
// Output: [ 'Edisi Pagi', 'Edisi Siang' ]
```

Kasus lain: Mendaftarkan beberapa pendengar pada event yang sama akan dieksekusi secara berurutan sesuai urutan pendaftaran.

```javascript
import { EventEmitter } from "node:events";

const antrean = new EventEmitter();
const hasil = [];

antrean.on("tugas", () => hasil.push("Langkah 1"));
antrean.on("tugas", () => hasil.push("Langkah 2"));

antrean.emit("tugas");
console.log(hasil);
// Output: [ 'Langkah 1', 'Langkah 2' ]
```

### `emitter.once()`

Metode `emitter.once()` mendaftarkan fungsi pendengar yang hanya dieksekusi satu kali saat event pertama kali dipancarkan, kemudian pendengar tersebut langsung dilepaskan secara otomatis.

```javascript
import { EventEmitter } from "node:events";

const server = new EventEmitter();
let totalLogin = 0;

server.once("loginPerdana", (user) => {
  totalLogin += 1;
  console.log(`Selamat datang ${user}`);
});

server.emit("loginPerdana", "Joko");
// Output: Selamat datang Joko

server.emit("loginPerdana", "Budi");
console.log(totalLogin);
// Output: 1
```

Kasus lain: Pemancaran event berikutnya setelah pemanggilan pertama diabaikan secara aman tanpa memicu galat.

```javascript
import { EventEmitter } from "node:events";

const saklar = new EventEmitter();
let hitungan = 0;

saklar.once("aktif", () => hitungan++);
saklar.emit("aktif");
saklar.emit("aktif");

console.log(hitungan);
// Output: 1
```

### `emitter.emit()`

Metode `emitter.emit()` memancarkan nama event tertentu dan mengeksekusi semua pendengar terdaftar secara sinkron bersama argumen payload yang disertakan.

```javascript
import { EventEmitter } from "node:events";

const pembayar = new EventEmitter();

pembayar.on("sukses", (id, total) => {
  console.log(`Invoice ${id}: Rp${total}`);
});

const adaListener = pembayar.emit("sukses", "INV-001", 50000);
// Output: Invoice INV-001: Rp50000

console.log(adaListener);
// Output: true
```

Kasus lain: Memancarkan event yang tidak memiliki pendengar mengembalikan nilai boolean `false`.

```javascript
import { EventEmitter } from "node:events";

const em = new EventEmitter();
const terkirim = em.emit("tanpaPendengar", "halo");

console.log(terkirim);
// Output: false
```

### `emitter.off()`

Metode `emitter.off()` melepaskan fungsi pendengar tertentu dari daftar langganan event. Fungsi yang dilepas harus merujuk pada referensi memori yang sama persis saat didaftarkan.

```javascript
import { EventEmitter } from "node:events";

const sistem = new EventEmitter();
const pesan = [];

const pencatat = (teks) => pesan.push(teks);

sistem.on("log", pencatat);
sistem.emit("log", "Aktivitas 1");

sistem.off("log", pencatat);
sistem.emit("log", "Aktivitas 2");

console.log(pesan);
// Output: [ 'Aktivitas 1' ]
```

Kasus lain: Melepas pendengar menggunakan fungsi panah anonim baru tidak akan mencocokkan referensi asli sehingga listener lama tetap aktif.

```javascript
import { EventEmitter } from "node:events";

const sistem = new EventEmitter();
let hitungan = 0;

sistem.on("klik", () => hitungan++);
sistem.off("klik", () => hitungan++);

sistem.emit("klik");
console.log(hitungan);
// Output: 1
```

### `emitter.removeAllListeners()`

Metode `emitter.removeAllListeners()` menghapus semua pendengar yang terdaftar pada satu nama event, atau menghapus seluruh pendengar dari setiap event jika dipanggil tanpa argumen.

```javascript
import { EventEmitter } from "node:events";

const saluran = new EventEmitter();

saluran.on("suhu", () => {});
saluran.on("suhu", () => {});
saluran.on("kelembapan", () => {});

saluran.removeAllListeners("suhu");

console.log(saluran.listenerCount("suhu"));
// Output: 0
console.log(saluran.listenerCount("kelembapan"));
// Output: 1
```

Kasus lain: Memanggil metode ini tanpa argumen menghapus seluruh pendengar dari semua event yang ada.

```javascript
import { EventEmitter } from "node:events";

const saluran = new EventEmitter();
saluran.on("a", () => {});
saluran.on("b", () => {});

saluran.removeAllListeners();
console.log(saluran.eventNames().length);
// Output: 0
```

### `emitter.listenerCount()`

Metode `emitter.listenerCount()` mengembalikan angka integer yang menunjukkan total pendengar yang saat ini terdaftar pada sebuah nama event.

```javascript
import { EventEmitter } from "node:events";

const audit = new EventEmitter();
audit.on("transaksi", () => {});
audit.on("transaksi", () => {});

const total = audit.listenerCount("transaksi");
console.log(total);
// Output: 2
```

Kasus lain: Menghitung pendengar pada event yang belum pernah dibuat menghasilkan nilai 0.

```javascript
import { EventEmitter } from "node:events";

const audit = new EventEmitter();
console.log(audit.listenerCount("namaFiktif"));
// Output: 0
```

### `emitter.setMaxListeners()`

Metode `emitter.setMaxListeners()` mengubah batas peringatan jumlah pendengar maksimum pada satu instance. Jika jumlah pendengar melebihi batas ini, Node.js mencetak peringatan potensi kebocoran memori.

```javascript
import { EventEmitter } from "node:events";

const sinkronisasi = new EventEmitter();
sinkronisasi.setMaxListeners(25);

console.log(sinkronisasi.getMaxListeners());
// Output: 25
```

Kasus lain: Menetapkan batas menjadi 0 menonaktifkan peringatan kuota pendengar tanpa batas.

```javascript
import { EventEmitter } from "node:events";

const tanpaBatas = new EventEmitter();
tanpaBatas.setMaxListeners(0);

console.log(tanpaBatas.getMaxListeners());
// Output: 0
```

### `events.once()`

Fungsi utilitas `once()` dari modul `node:events` mengonversi penantian suatu event menjadi Promise sehingga proses pemanggilan dapat diselaraskan menggunakan kata kunci `await`.

```javascript
import { EventEmitter, once } from "node:events";

const pengunggah = new EventEmitter();

setTimeout(() => {
  pengunggah.emit("selesai", { status: "sukses", berkas: "gambar.png" });
}, 10);

const [hasil] = await once(pengunggah, "selesai");
console.log(hasil.status, hasil.berkas);
// Output: sukses gambar.png
```

Kasus lain: Membatalkan penantian event menggunakan `AbortSignal` yang melempar galat `AbortError`.

```javascript
import { EventEmitter, once } from "node:events";

const em = new EventEmitter();
const ac = new AbortController();
ac.abort();

try {
  await once(em, "data", { signal: ac.signal });
} catch (error) {
  console.log(error.name);
  // Output: AbortError
}
```

---

## Kesalahan Umum

### Memancarkan Event 'error' Tanpa Mendaftarkan Pendengar

Memancarkan event bernama `'error'` tanpa ada listener yang mendengarkan menyebabkan Node.js menganggapnya sebagai pengecualian yang tidak tertangani dan menghentikan proses aplikasi.

```javascript
// Salah
import { EventEmitter } from "node:events";

const em = new EventEmitter();
em.emit("error", new Error("Koneksi gagal"));
```

```javascript
// Benar
import { EventEmitter } from "node:events";

const em = new EventEmitter();
em.on("error", (err) => {
  console.log("Tertangani:", err.message);
});
em.emit("error", new Error("Koneksi gagal"));
```

### Mengasumsikan Bahwa `emit()` Berjalan Secara Asinkron

Metode `emit()` mengeksekusi semua listener secara sinkron dan berurutan, sehingga tidak menunggu Promise di dalam fungsi listener selesai.

```javascript
// Salah
import { EventEmitter } from "node:events";

const em = new EventEmitter();
em.on("simpan", async () => {
  await new Promise((r) => setTimeout(r, 100));
});
await em.emit("simpan");
```

```javascript
// Benar
import { EventEmitter } from "node:events";

const em = new EventEmitter();
const antrean = [];

em.on("simpan", (daftarTugas) => {
  daftarTugas.push(new Promise((r) => setTimeout(r, 10)));
});

em.emit("simpan", antrean);
await Promise.all(antrean);
```

### Menambahkan Pendengar Berulang Tanpa Membersihkannya

Mendaftarkan listener di dalam fungsi penanganan rute tanpa pernah memanggil `off` menumpuk referensi fungsi di memori hingga memicu peringatan kebocoran memori.

```javascript
// Salah
import { EventEmitter } from "node:events";

const bus = new EventEmitter();
function handleRequest() {
  bus.on("selesai", () => {});
}
```

```javascript
// Benar
import { EventEmitter } from "node:events";

const bus = new EventEmitter();
function handleRequest() {
  const selesaiHandler = () => {};
  bus.on("selesai", selesaiHandler);
  bus.off("selesai", selesaiHandler);
}
```

---

## Studi Kasus

Skenario: Membangun sistem alur kerja pemrosesan pesanan belanja berbasis `EventEmitter` yang mengoordinasikan audit, konfirmasi, dan penanganan galat secara terisolasi tanpa kopling erat.

```javascript
import { EventEmitter } from "node:events";

class OrderProcessor extends EventEmitter {
  prosesPesanan(pesanan) {
    if (!pesanan.id || pesanan.total <= 0) {
      this.emit("error", new Error("Payload pesanan tidak valid"));
      return;
    }

    this.emit("dibuat", pesanan);
    this.emit("sukses", { id: pesanan.id, waktu: "2026-10-12T00:00:00.000Z" });
  }
}

const processor = new OrderProcessor();
const catatanAudit = [];

processor.on("error", (err) => {
  console.log("Error tertangani:", err.message);
});

processor.on("dibuat", (pesanan) => {
  catatanAudit.push(`Pesanan ${pesanan.id} sebesar ${pesanan.total}`);
});

processor.once("sukses", (ringkasan) => {
  console.log(`Email konfirmasi dikirim untuk pesanan ${ringkasan.id}`);
});

processor.prosesPesanan({ id: "ORD-99", total: 150000 });
// Output: Email konfirmasi dikirim untuk pesanan ORD-99

processor.prosesPesanan({ id: "ORD-INVALID", total: 0 });
// Output: Error tertangani: Payload pesanan tidak valid

console.log(catatanAudit);
// Output: [ 'Pesanan ORD-99 sebesar 150000' ]
```

Desain ini memisahkan logika bisnis validasi pesanan dari aksi sampingan seperti pengiriman notifikasi dan pencatatan riwayat audit. Pemisahan berbasis event ini memungkinkan penambahan modul pendengar baru di masa mendatang tanpa perlu memodifikasi logika inti kelas `OrderProcessor`.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat kelas `AlarmSystem` yang mewarisi `EventEmitter`. Kelas ini memiliki metode `trigger(lokasi)` yang memancarkan event `'alarm'` dengan payload berupa objek `{ lokasi, waktu: '2026-10-12T00:00:00.000Z' }`.

Contoh masukan:

```javascript
const alarm = new AlarmSystem();
alarm.on("alarm", (info) => console.log(info.lokasi));
alarm.trigger("Gudang B");
```

Contoh keluaran yang diharapkan:

```javascript
// Gudang B
```

Batasan: Wajib menggunakan sintaks pewarisan kelas `extends EventEmitter` dari modul `node:events`.

### Soal 2 (Menengah)

Buat kelas `DownloadQueue` yang mewarisi `EventEmitter`. Kelas ini memiliki metode `tambahTugas(namaBerkas)` dan `eksekusi()`. Saat `eksekusi()` dipanggil, kelas memancarkan event `'kemajuan'` untuk setiap berkas yang diproses, dan memancarkan event `'selesai'` di akhir bersama array berisi daftar seluruh berkas yang telah tuntas.

Contoh masukan:

```javascript
const queue = new DownloadQueue();
queue.tambahTugas("foto.jpg");
queue.tambahTugas("arsip.zip");

queue.on("kemajuan", (nama) => console.log("Proses:", nama));
queue.on("selesai", (daftar) => console.log("Total berkas:", daftar.length));

queue.eksekusi();
```

Contoh keluaran yang diharapkan:

```javascript
// Proses: foto.jpg
// Proses: arsip.zip
// Total berkas: 2
```

Batasan: Wajib menggunakan `EventEmitter`, dan dilarang memutasikan array masukan luar.

### Soal 3 (Menantang)

Buat kelas `ReliableTaskEmitter` yang mengelola eksekusi tugas bertahap dengan mekanisme percobaan ulang (_retry_) terpadu.

Metode `jalankanTugas(namaTugas, fungsiTugas, maksPercobaan = 3)`:
- Memancarkan event `'coba'` setiap kali percobaan dieksekusi dengan nomor putaran percobaan.
- Jika fungsi tugas melempar galat, tangkap secara internal dan coba kembali hingga mencapai batas `maksPercobaan`.
- Jika percobaan berhasil sebelum batas terlampaui, pancarkan event `'berhasil'` bersama hasil eksekusi dan hentikan iterasi.
- Jika seluruh batas percobaan terlampaui dan tugas tetap gagal, pancarkan event `'error'` dengan pesan galat akhir (wajib dipasang pendengar `'error'` agar proses tidak crash).

Contoh masukan 1:

```javascript
const emitter = new ReliableTaskEmitter();
let hitung = 0;

emitter.on("berhasil", (res) => console.log("Hasil:", res));
await emitter.jalankanTugas("kalkulasi", async () => {
  hitung++;
  if (hitung < 2) throw new Error("Gagal sementara");
  return 42;
});
```

Contoh keluaran 1:

```javascript
// Hasil: 42
```

Contoh masukan 2:

```javascript
const emitter = new ReliableTaskEmitter();
emitter.on("error", (err) => console.log("Galat fatal:", err.message));

await emitter.jalankanTugas("koneksi", async () => {
  throw new Error("Server tidak merespons");
}, 2);
```

Contoh keluaran 2:

```javascript
// Galat fatal: Server tidak merespons
```

Batasan: Dilarang menggunakan pustaka eksternal. Wajib mengimplementasikan penanganan galat aman pada event `'error'` tanpa membiarkan runtime terhenti paksa.

---

## Navigasi

[Sebelumnya: File System](../07-file-system/README.md) | [Selanjutnya: Buffer](../09-buffer/README.md) | [Daftar Isi](../README.md)
