# Debugger

> Ringkasan
>
> - Fungsi: Menghentikan sementara alur eksekusi program pada titik tertentu, memeriksa nilai variabel secara langsung, dan menelusuri kode baris demi baris menggunakan protokol V8 Inspector.
> - Digunakan saat: Menginvestigasi galat logika rumit yang sulit ditemukan dengan logging biasa, menganalisis kebocoran memori, atau melakukan profiling performa CPU.
> - Aturan praktis: Jangan pernah membuka port debugger ke alamat publik (`0.0.0.0`) karena protokol V8 Inspector tidak memiliki otentikasi bawaan dan membuka celah eksekusi kode berbahaya jarak jauh (_Remote Code Execution_).

---

## Tujuan Belajar

- Menempatkan titik henti terprogram di dalam kode JavaScript menggunakan pernyataan `debugger;`.
- Mengendalikan sesi pelacakan baris demi baris di terminal via utilitas bawaan `node inspect`.
- Menghubungkan proses Node.js ke antarmuka inspeksi visual seperti Chrome DevTools dan VS Code.
- Mengontrol siklus hidup listener V8 Inspector secara terprogram melalui modul `node:inspector`.
- Mengamankan konfigurasi port debugging pada lingkungan peladen.

---

## Konsep

> Debugger dianalogikan seperti tombol jeda (_pause_) dan rekaman gerak lambat pada siaran pertandingan olahraga. Saat pertandingan berlangsung secara langsung, pergerakan bola dan pemain terlalu cepat untuk memastikan terjadinya pelanggaran (_kode berjalan normal tanpa henti_). Menggunakan **Debugger** sama seperti menekan tombol **Pause** tepat di momen benturan terjadi (_breakpoint_). Peninjau dapat memajukan video frame demi frame (_step over_), berganti sudut pandang kamera untuk melihat posisi setiap pemain (_inspeksi variabel_), mendengarkan percakapan mikrofon wasit (_step into_), lalu menekan tombol Play untuk melanjutkan kembali pertandingan (_resume_).

```mermaid
flowchart LR
    NODE["Runtime Node.js (V8 Engine)"] <-->|V8 Inspector Protocol (WebSocket)| CLIENT["Klien Debugger (Chrome DevTools / VS Code / node inspect)"]
    NODE --> BP["Titik Henti: debugger; / Breakpoint UI"]
    CLIENT --> CMD["Kontrol Navigasi: Step Over, Step Into, Resume, REPL"]
```

---

## Referensi

| Item | Fungsi | Catatan |
| :--- | :--- | :--- |
| **`debugger;`** | Menandai titik henti eksekusi terprogram di dalam kode JavaScript | Diabaikan oleh runtime jika dieksekusi tanpa flag inspect aktif |
| **`node inspect`** | Membuka CLI debugger interaktif bawaan Node.js di terminal | Menyediakan perintah navigasi teks seperti `c`, `n`, `s`, dan `repl` |
| **`--inspect`** | Mengaktifkan port listener protokol V8 Inspector | Secara bawaan mendengarkan pada alamat lokal `127.0.0.1:9229` |
| **`--inspect-brk`** | Mengaktifkan V8 Inspector dan menghentikan proses di baris pertama kode | Menunggu klien debugger terhubung sebelum mengeksekusi baris awal |
| **`inspector.open()`** | Membuka port listener V8 Inspector secara terprogram dari kode JavaScript | Berguna untuk mengaktifkan debugging saat mendeteksi kondisi anomali |
| **`inspector.close()`** | Menutup port listener V8 Inspector dan memutuskan koneksi aktif | Mengamankan kembali port jaringan setelah sesi diagnostik selesai |
| **`inspector.url()`** | Mengembalikan string URL WebSocket dari listener debugger yang aktif | Mengembalikan `undefined` jika listener debugger sedang tidak aktif |
| **`inspector.waitForDebugger()`** | Menghentikan eksekusi sementara hingga klien debugger terhubung | Menjamin instruksi kritis tidak dieksekusi sebelum debugger siap |
| **`inspector.Session`** | Membuat koneksi terprogram ke Chrome DevTools Protocol (CDP) | Memungkinkan profiling CPU dan pengambilan snapshot memori secara mandiri |

### `debugger;`

Pernyataan `debugger;` menginstruksikan mesin V8 untuk menghentikan eksekusi kode ketika sesi debugging sedang aktif. Jika program dijalankan secara biasa (`node file.js`), pernyataan ini diabaikan tanpa menimbulkan galat.

```javascript
function hitungTotalBelanja(hargaSatuan, jumlahBarang) {
  const subtotal = hargaSatuan * jumlahBarang;

  // Titik henti terprogram
  debugger;

  const pajak = subtotal * 0.11;
  return subtotal + pajak;
}

const total = hitungTotalBelanja(25000, 4);
console.log(total);
// Output: 111000
```

Kasus lain: Menempatkan beberapa pernyataan `debugger;` untuk memeriksa perubahan nilai variabel pada setiap iterasi loop.

```javascript
let akumulasi = 0;
for (let i = 1; i <= 3; i++) {
  akumulasi += i;
  debugger; // Berhenti pada setiap putaran loop
}

console.log(akumulasi);
// Output: 6
```

### `node inspect`

Perintah terminal `node inspect` menjalankan aplikasi di bawah antarmuka debugging interaktif berbasis teks di command line.

```bash
# Menjalankan berkas di bawah debugger terminal
node inspect aplikasi.js
```

Di dalam antarmuka debugger terminal, perintah navigasi utama meliputi:

| Perintah | Kepanjangan | Fungsi |
| :--- | :--- | :--- |
| **`c`** | _cont / continue_ | Melanjutkan eksekusi hingga breakpoint berikutnya |
| **`n`** | _next_ | Melangkah ke baris kode berikutnya (_Step Over_) |
| **`s`** | _step_ | Masuk ke dalam fungsi yang dipanggil (_Step Into_) |
| **`o`** | _out_ | Melangkah keluar dari fungsi saat ini (_Step Out_) |
| **`repl`** | _eval_ | Membuka shell evaluasi interaktif untuk memeriksa variabel |

Kasus lain: Mengetikkan `watch('namaVariabel')` di sesi `node inspect` untuk memantau perubahan nilai variabel tertentu secara otomatis di setiap langkah.

### `--inspect`

Flag baris perintah `--inspect` menginstruksikan Node.js untuk membuka port listener WebSocket protokol V8 Inspector (secara default pada `127.0.0.1:9229`) tanpa menghentikan jalannya kode.

```bash
# Membuka port listener debugger pada alamat localhost bawaan
node --inspect server.js
```

Program akan langsung berjalan normal. Pengembang dapat membuka peramban Google Chrome pada URL `chrome://inspect`, lalu memilih target Node.js yang muncul untuk membuka antarmuka visual DevTools.

Kasus lain: Menentukan alamat IP dan port kustom secara eksplisit untuk mencegah tabrakan port dengan proses lain.

```bash
node --inspect=127.0.0.1:9330 server.js
```

### `--inspect-brk`

Flag `--inspect-brk` membuka listener V8 Inspector dan langsung menahan eksekusi proses pada baris kode paling pertama, menunggu klien debugger tersambung sebelum melanjutkan.

```bash
# Berhenti di baris pertama menunggu klien terhubung
node --inspect-brk skrip-migrasi.js
```

Opsi ini sangat krusial saat menelusuri bug yang terjadi pada tahap inisialisasi modul atau saat proses bootstrapping aplikasi berlangsung sangat cepat.

Kasus lain: Mengombinasikan `--inspect-brk` dengan port kustom saat menjalankan uji coba otomatis.

```bash
node --inspect-brk=127.0.0.1:9440 skrip-migrasi.js
```

### `inspector.open()`

Fungsi `inspector.open()` dari modul bawaan `node:inspector` membuka port listener debugger secara terprogram langsung dari kode JavaScript tanpa memerlukan penambahan flag CLI saat proses dijalankan.

```javascript
import inspector from "node:inspector";

// Buka listener debugger pada port acak lokal yang tersedia
inspector.open(0, "127.0.0.1");

const urlDebugger = inspector.url();
console.log(typeof urlDebugger);
// Output: string

inspector.close();
```

Kasus lain: Melewatkan nilai `true` pada parameter ketiga untuk menahan eksekusi hingga klien debugger pertama terhubung.

```javascript
import inspector from "node:inspector";

// inspector.open(port, host, wait)
inspector.open(0, "127.0.0.1", false);
inspector.close();

console.log(inspector.url());
// Output: undefined
```

### `inspector.close()`

Fungsi `inspector.close()` menonaktifkan listener V8 Inspector dan menutup seluruh koneksi WebSocket klien yang sedang terhubung, mengembalikan proses ke status non-debugging.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
console.log(typeof inspector.url());
// Output: string

inspector.close();
console.log(inspector.url());
// Output: undefined
```

Kasus lain: Memanggil `inspector.close()` saat listener memang sedang tidak berjalan tidak akan melempar galat runtime.

```javascript
import inspector from "node:inspector";

inspector.close();
console.log(inspector.url());
// Output: undefined
```

### `inspector.url()`

Fungsi `inspector.url()` mengembalikan string alamat endpoint WebSocket dari listener V8 Inspector yang sedang aktif, atau `undefined` jika tidak ada sesi listener yang berjalan.

```javascript
import inspector from "node:inspector";

console.log(inspector.url());
// Output: undefined

inspector.open(0, "127.0.0.1");
console.log(inspector.url().startsWith("ws://127.0.0.1:"));
// Output: true

inspector.close();
```

Kasus lain: Mengekstrak ID UUID sesi debugging yang tertera di bagian akhir URL WebSocket.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
const alamat = inspector.url();
const idSesi = alamat.split("/").pop();

console.log(idSesi.length === 36);
// Output: true

inspector.close();
```

### `inspector.waitForDebugger()`

Fungsi `inspector.waitForDebugger()` menghentikan sementara jalannya thread utama Node.js hingga ada klien eksternal (seperti VS Code atau Chrome DevTools) yang berhasil terhubung ke port listener WebSocket.

```javascript
import inspector from "node:inspector";

inspector.open(0, "127.0.0.1");
console.log(typeof inspector.waitForDebugger);
// Output: function

inspector.close();
```

Kasus lain: Memanggil `waitForDebugger()` saat listener belum dibuka dengan `inspector.open()` tidak memiliki pengaruh apa pun pada thread.

```javascript
import inspector from "node:inspector";

inspector.waitForDebugger();
console.log(inspector.url());
// Output: undefined
```

### `inspector.Session`

Kelas `inspector.Session` menyediakan jembatan komunikasi dua arah ke Chrome DevTools Protocol (CDP) secara terprogram dari dalam kode JavaScript, memungkinkan pengumpulan data profil performa tanpa membuka port jaringan.

```javascript
import inspector from "node:inspector";

const sesi = new inspector.Session();
sesi.connect();

let terhubung = false;
sesi.post("Runtime.enable", () => {
  terhubung = true;
});

sesi.disconnect();
console.log(typeof sesi.post);
// Output: function
```

Kasus lain: Menangkap galat saat mengirim perintah CDP yang tidak dikenali oleh domain protokol V8.

```javascript
import inspector from "node:inspector";

const sesi = new inspector.Session();
sesi.connect();

sesi.post("DomainTidakAda.perintah", (error) => {
  console.log(error !== null);
  // Output: true
});

sesi.disconnect();
```

### Perbandingan: `--inspect` vs `--inspect-brk`

| Karakteristik | `--inspect` | `--inspect-brk` |
| :--- | :--- | :--- |
| **Titik Henti Awal** | Program langsung dieksekusi hingga menemui titik henti `debugger;` | Program langsung dijeda pada baris pertama sebelum mengeksekusi instruksi apa pun |
| **Skenario Penggunaan** | Menelusuri aplikasi server jangka panjang yang sudah berjalan | Menelusuri galat pada fase inisialisasi awal, migrasi, atau konfigurasi startup |
| **Ketergantungan Klien** | Program tetap menyelesaikan tugas meskipun klien tidak tersambung | Program menunggu klien terhubung sebelum menjalankan alur program |

---

## Kesalahan Umum

### Membuka Port Inspector ke Alamat Jaringan Publik `0.0.0.0`

Menjalankan flag `--inspect=0.0.0.0` di server produksi membuka port 9229 ke seluruh jaringan publik. Karena protokol V8 Inspector tidak memiliki otorisasi, penyerang dapat menyambungkan klien DevTools dan mengeksekusi kode arbitrary (_Remote Code Execution_) pada sistem host.

```bash
# Salah
node --inspect=0.0.0.0:9229 server.js
```

```bash
# Benar
node --inspect=127.0.0.1:9229 server.js
```

### Meninggalkan Pernyataan `debugger;` di Basis Kode Produksi

Meskipun diabaikan jika runtime dijalankan tanpa flag inspect, membiarkan pernyataan `debugger;` di repositori produksi melanggar aturan linter (`no-debugger`), membingungkan pengembang lain, dan memicu jeda proses mendadak jika seseorang menjalankan server dengan flag inspect aktif.

```javascript
// Salah
function prosesPembayaran(transaksi) {
  debugger; // Tertinggal di kode rilis produksi
  return kirimKeBank(transaksi);
}
```

```javascript
// Benar
function prosesPembayaran(transaksi) {
  // Gunakan logging diagnostik formal atau hapus sebelum rilis
  return kirimKeBank(transaksi);
}
```

### Tertukar Antara Perintah Step Over (`n`) dan Step Into (`s`)

Menggunakan `next` (`n`) saat baris memanggil fungsi internal akan melompati seluruh isi fungsi tersebut (_Step Over_). Sebaliknya, menggunakan `step` (`s`) pada modul eksternal akan menyeret penelusuran masuk ke ribuan baris kode internal Node.js.

```javascript
// Salah
// Menggunakan 's' saat kursor berada di pemanggilan fungsi modul bawaan internal
fs.readFileSync("data.txt"); // Menyeret debugger masuk ke kode internal node:fs
```

```javascript
// Benar
// Gunakan 'n' untuk melewati fungsi pustaka luar, dan 's' hanya untuk fungsi logika bisnis sendiri
```

---

## Studi Kasus

Skenario: Membangun mekanisme aktivasi debugger terprogram darurat (_emergency on-demand debugger activator_). Ketika aplikasi server mendeteksi kegagalan transaksi kritis berturut-turut, sistem secara otomatis membuka listener V8 Inspector pada port lokal dinamis, mencatat URL WebSocket diagnostik, menunggu intervensi teknisi secara aman, lalu memastikan listener ditutup kembali setelah investigasi selesai.

```javascript
import inspector from "node:inspector";

class PengawasDiagnostikDarurat {
  #jumlahKegagalan = 0;
  #ambangBatas = 3;
  #sesiAktif = false;

  catatInsiden(galat) {
    this.#jumlahKegagalan++;

    if (this.#jumlahKegagalan >= this.#ambangBatas && !this.#sesiAktif) {
      // Buka debugger secara terprogram hanya pada alamat localhost aman
      inspector.open(0, "127.0.0.1", false);
      this.#sesiAktif = true;

      return {
        modeDarurat: true,
        pesan: "Ambang batas kegagalan terlampaui. Port debugger lokal dibuka.",
        urlInspeksi: inspector.url(),
        penyebab: galat.message,
      };
    }

    return {
      modeDarurat: false,
      jumlahKegagalanSaatIni: this.#jumlahKegagalan,
    };
  }

  tutupSesiDarurat() {
    if (this.#sesiAktif) {
      inspector.close();
      this.#sesiAktif = false;
      this.#jumlahKegagalan = 0;
    }
  }
}

const pengawas = new PengawasDiagnostikDarurat();

pengawas.catatInsiden(new Error("Timeout transaksi 1"));
pengawas.catatInsiden(new Error("Timeout transaksi 2"));
const statusKritis = pengawas.catatInsiden(new Error("Timeout transaksi 3"));

console.log(statusKritis.modeDarurat);
// Output: true
console.log(typeof statusKritis.urlInspeksi);
// Output: string

pengawas.tutupSesiDarurat();
console.log(inspector.url());
// Output: undefined
```

Desain ini dipilih karena mengisolasi port debugger ke alamat `127.0.0.1`, hanya mengaktifkan protokol V8 Inspector saat terjadi anomali kritis nyata, serta menyediakan metode penutupan bersih untuk mengeliminasi eksposur port yang tidak perlu.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `hitungTarifPengiriman(beratKg, jarakKm, opsiKilat)` yang menghitung ongkos kirim (berat dikali Rp10.000, ditambah jarak dikali Rp2.000, dan biaya tambahan kilat Rp25.000 jika `opsiKilat` bernilai `true`). Tempatkan pernyataan `debugger;` tepat setelah perhitungan biaya dasar dan sebelum kalkulasi biaya kilat. Kembalikan total tarif dalam bentuk angka integer.

Contoh masukan:

```javascript
hitungTarifPengiriman(2, 10, true);
```

Contoh keluaran yang diharapkan:

```javascript
65000
```

Batasan: Gunakan pernyataan `debugger;` native di dalam alur fungsi.

### Soal 2 (Menengah)

Buat fungsi `jalankanDenganInspeksiTerbatas(fungsiOperasi, portKustom)` yang membungkus pemanggilan `fungsiOperasi()`. Fungsi harus membuka listener V8 Inspector pada alamat lokal `'127.0.0.1'` dan port `portKustom` via `inspector.open()`, mengeksekusi `fungsiOperasi()`, mengumpulkan URL WebSocket yang aktif via `inspector.url()`, serta menjamin penutupan listener via `inspector.close()` di dalam blok `finally`.

Contoh masukan:

```javascript
const tugas = () => ({ status: "selesai", hasil: 42 });
jalankanDenganInspeksiTerbatas(tugas, 0);
```

Contoh keluaran yang diharapkan:

```javascript
{
  sukses: true,
  data: { status: 'selesai', hasil: 42 },
  pernahAktif: true
}
```

Batasan: Gunakan modul bawaan `node:inspector` dan struktur penanganan `try...finally`.

### Soal 3 (Menantang)

Buat modul profiler runtime mandiri bernama `tangkapJejakEvaluasi(fungsiUji)` yang menggunakan kelas `inspector.Session` untuk berinteraksi langsung dengan Chrome DevTools Protocol tanpa membuka port jaringan TCP.

Ketentuan pemrosesan:

- Buat instans `new inspector.Session()` dan hubungkan menggunakan `session.connect()`.
- Kirim perintah CDP `'Profiler.enable'` untuk mengaktifkan mesin profiler V8.
- Mulai perekaman CPU dengan mengirimkan perintah `'Profiler.start'`.
- Eksekusi fungsi `fungsiUji()`.
- Hentikan perekaman CPU menggunakan perintah `'Profiler.stop'` dan tangkap objek profil yang dikembalikan oleh V8.
- Putuskan sesi secara bersih menggunakan `session.disconnect()`.
- Ekstrak nama fungsi akar, durasi waktu sampel (_timeDeltas_), dan total node tumpukan fungsi yang terekam.
- Kembalikan objek `{ berhasil: true, totalNode: <number>, durasiSampelMs: <number> }`.

Contoh masukan:

```javascript
const ujiKomputasi = () => {
  let total = 0;
  for (let i = 0; i < 500000; i++) total += i;
  return total;
};

await tangkapJejakEvaluasi(ujiKomputasi);
```

Contoh keluaran yang diharapkan:

```javascript
{
  berhasil: true,
  totalNode: 12,
  durasiSampelMs: 15.4
}
```

Batasan: Wajib menggunakan `inspector.Session` native dari `node:inspector` dengan konversi callback CDP ke Promise. Dilarang membuka port jaringan ke luar.

---

## Navigasi

[Sebelumnya: Util](../20-util/README.md) | [Selanjutnya: Console](../22-console/README.md) | [Daftar Isi](../README.md)
