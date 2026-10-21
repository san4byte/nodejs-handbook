# Buffer

> Ringkasan
>
> - Fungsi: Mengelola dan memanipulasi aliran data biner mentah langsung pada alokasi memori C++ di luar memori heap V8.
> - Digunakan saat: Membaca berkas biner (seperti gambar atau audio), mentransfer paket data jaringan TCP, mengolah enkripsi kriptografi, dan mengubah format encoding data.
> - Aturan praktis: Selalu gunakan metode modern seperti `Buffer.from()` atau `Buffer.alloc()`, tinggalkan konstruktor usang `new Buffer()`, serta cantumkan encoding secara jelas.

---

## Tujuan Belajar

- Memahami peran kelas `Buffer` dalam mengolah data biner mentah di runtime Node.js.
- Mengalokasikan memori buffer dengan aman menggunakan `Buffer.alloc()` dan `Buffer.from()`.
- Mengonversi data biner ke format teks dan encoding populer seperti UTF-8, Base64, dan Hex.
- Menggabungkan beberapa potongan buffer menjadi satu kesatuan utuh lewat `Buffer.concat()`.
- Menghitung ukuran fisik byte yang sebenarnya dengan `Buffer.byteLength()` serta mengambil irisan byte lewat `subarray()`.

---

## Konsep

Kita bisa membayangkan `Buffer` seperti ember penampung air dengan ukuran yang sudah ditentukan sejak awal. Pada awalnya, JavaScript di browser hanya dirancang untuk mengolah teks string. Namun, saat bekerja di sisi server, komputer dan jaringan berkomunikasi menggunakan aliran partikel biner mentah (deretan angka `0` dan `1`).

Node.js menyediakan wadah bernama `Buffer` dengan kapasitas byte yang terkunci sejak pertama kali dibuat. Aliran data biner yang masuk dari internet atau berkas disk akan ditampung sementara di dalam ember memori ini sebelum kita terjemahkan menjadi teks yang bisa dibaca manusia, disimpan ke database, atau dikirimkan ke modul lainnya.

```mermaid
flowchart LR
    STRING["String Teks ('Hello')"] -- "Buffer.from(text, 'utf-8')" --> BINARY["Buffer Biner Mentah [0x48, 0x65, 0x6c, 0x6c, 0x6f]"]
    BINARY -- "buf.toString('base64')" --> BASE64["String Base64 ('SGVsbG8=')"]
    BINARY -- "buf.toString('hex')" --> HEX["String Hex ('48656c6c6f')"]
```

---

## Referensi

| Item                       | Fungsi                                                                  | Catatan                                                              |
| :------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------- |
| **`Buffer.from()`**        | Membuat instance buffer baru dari string, array angka, atau buffer lain | Mendukung decoding UTF-8, Base64, Hex, dan latin1                    |
| **`Buffer.alloc()`**       | Menyiapkan blok memori berukuran tetap yang sudah diisi angka nol       | Aman digunakan karena membersihkan sisa data memori lama             |
| **`Buffer.allocUnsafe()`** | Mengalokasikan memori cepat tanpa membersihkan isi awalnya              | Prosesnya sangat cepat namun berisiko menyimpan sisa memori lama     |
| **`buf.toString()`**       | Mengubah byte biner di dalam buffer menjadi teks string                 | Menerima opsi encoding seperti `'utf-8'`, `'base64'`, atau `'hex'`   |
| **`Buffer.concat()`**      | Menggabungkan susunan beberapa buffer menjadi satu buffer baru          | Membantu merangkai kembali paket data yang diterima bertahap         |
| **`Buffer.isBuffer()`**    | Memastikan apakah suatu variabel merupakan instance dari `Buffer`       | Mengembalikan nilai boolean `true` atau `false` dengan aman          |
| **`Buffer.byteLength()`**  | Menghitung jumlah ukuran byte fisik aktual dari string teks             | Menghasilkan nilai berbeda dari `string.length` pada karakter khusus |
| **`buf.subarray()`**       | Mengambil potongan referensi byte tanpa menyalin memori baru            | Berbagi memori yang sama persis dengan buffer sumber aslinya         |

### `Buffer.from()`

Fungsi `Buffer.from()` digunakan untuk membuat instance `Buffer` baru dengan menyalin data dari string teks, array angka byte, maupun objek buffer lainnya.

```javascript
import { Buffer } from "node:buffer";

const buf = Buffer.from("Hello Node", "utf-8");
console.log(buf.length);
// Output: 10
console.log(buf[0]);
// Output: 72
```

Kasus lain: Membuat buffer dari kumpulan angka integer 8-bit (dalam rentang nilai 0 sampai 255).

```javascript
import { Buffer } from "node:buffer";

const byteList = Buffer.from([65, 66, 67]);
console.log(byteList.toString("utf-8"));
// Output: ABC
```

### `Buffer.alloc()`

Fungsi `Buffer.alloc()` menyiapkan blok memori dengan ukuran tetap dan secara otomatis mengisi seluruh nilainya dengan angka nol (`0x00`) agar bersih dan aman.

```javascript
import { Buffer } from "node:buffer";

const emptyBuf = Buffer.alloc(4);
console.log(emptyBuf);
// Output: <Buffer 00 00 00 00>
```

Kasus lain: Mengisi alokasi memori baru dengan nilai byte kustom yang kita tentukan sendiri.

```javascript
import { Buffer } from "node:buffer";

const filledBuf = Buffer.alloc(3, 0xff);
console.log(filledBuf.toString("hex"));
// Output: ffffff
```

### `Buffer.allocUnsafe()`

Fungsi `Buffer.allocUnsafe()` menyiapkan alokasi memori baru tanpa membersihkan data lama yang tertinggal di blok memori tersebut. Cara ini membuat alokasi berjalan sangat cepat, namun kita harus berhati-hati agar tidak membocorkan data lama.

```javascript
import { Buffer } from "node:buffer";

const fastBuf = Buffer.allocUnsafe(4);
fastBuf.fill(0);
console.log(fastBuf.length);
// Output: 4
```

Kasus lain: Memberikan ukuran angka negatif akan memicu error `RangeError`.

```javascript
import { Buffer } from "node:buffer";

try {
  Buffer.allocUnsafe(-1);
} catch (error) {
  console.log(error.name);
  // Output: RangeError
}
```

### `buf.toString()`

Metode `buf.toString()` menerjemahkan deretan byte biner di dalam buffer menjadi teks string biasa menggunakan format encoding yang kita tentukan.

```javascript
import { Buffer } from "node:buffer";

const buf = Buffer.from("NodeJS", "utf-8");

console.log(buf.toString("hex"));
// Output: 4e6f64654a53
console.log(buf.toString("base64"));
// Output: Tm9kZUpT
```

Kasus lain: Mengambil sebagian potongan byte teks dengan menentukan batas indeks awal dan indeks akhir.

```javascript
import { Buffer } from "node:buffer";

const buf = Buffer.from("NodeJS", "utf-8");
console.log(buf.toString("utf-8", 0, 4));
// Output: Node
```

### `Buffer.concat()`

Fungsi `Buffer.concat()` menyatukan beberapa objek buffer yang tersimpan di dalam sebuah array menjadi satu kesatuan buffer panjang.

```javascript
import { Buffer } from "node:buffer";

const partA = Buffer.from("Left ");
const partB = Buffer.from("Right");
const combined = Buffer.concat([partA, partB]);

console.log(combined.toString("utf-8"));
// Output: Left Right
```

Kasus lain: Menggabungkan array kosong menghasilkan objek buffer baru dengan panjang 0 byte.

```javascript
import { Buffer } from "node:buffer";

const emptyBuf = Buffer.concat([]);
console.log(emptyBuf.length);
// Output: 0
```

### `Buffer.isBuffer()`

Fungsi `Buffer.isBuffer()` dipakai untuk memastikan apakah sebuah variabel benar-benar berupa instance resmi dari objek `Buffer`.

```javascript
import { Buffer } from "node:buffer";

const binaryData = Buffer.alloc(2);
const textData = "not a buffer";

console.log(Buffer.isBuffer(binaryData));
// Output: true
console.log(Buffer.isBuffer(textData));
// Output: false
```

Kasus lain: Memeriksa nilai seperti `null` atau `undefined` akan mengembalikan nilai boolean `false` tanpa menimbulkan error.

```javascript
import { Buffer } from "node:buffer";

console.log(Buffer.isBuffer(null));
// Output: false
```

### `Buffer.byteLength()`

Fungsi `Buffer.byteLength()` menghitung jumlah byte fisik sesungguhnya yang diperlukan untuk menyimpan sebuah string teks pada encoding tertentu.

```javascript
import { Buffer } from "node:buffer";

const text = "Café";
console.log(text.length);
// Output: 4
console.log(Buffer.byteLength(text, "utf-8"));
// Output: 5
```

Kasus lain: Menghitung panjang ukuran byte fisik dari teks berformat heksadesimal.

```javascript
import { Buffer } from "node:buffer";

const hexLength = Buffer.byteLength("4e6f6465", "hex");
console.log(hexLength);
// Output: 4
```

### `buf.subarray()`

Metode `buf.subarray()` menghasilkan potongan pandangan (_view_) dari suatu buffer tanpa membuat alokasi memori fisik baru.

```javascript
import { Buffer } from "node:buffer";

const original = Buffer.from("Node Library", "utf-8");
const slice = original.subarray(0, 4);

console.log(slice.toString("utf-8"));
// Output: Node
```

Kasus lain: Karena berbagi alamat memori yang sama, jika kita mengubah nilai byte pada hasil `subarray`, isi dari buffer induknya juga akan ikut berubah.

```javascript
import { Buffer } from "node:buffer";

const parent = Buffer.from("abc", "utf-8");
const child = parent.subarray(0, 1);
child[0] = 120;

console.log(parent.toString("utf-8"));
// Output: xbc
```

---

## Kesalahan Umum

### Memakai Sintaks Konstruktor Lama `new Buffer()`

Membuat buffer menggunakan perintah `new Buffer()` sudah lama ditinggalkan dan berisiko terhadap celah keamanan memori karena perilaku inisialisasinya yang tidak konsisten.

```javascript
// Salah
const buf = new Buffer(10);
```

```javascript
// Benar
import { Buffer } from "node:buffer";

const buf = Buffer.alloc(10);
```

### Menyamakan `string.length` dengan Ukuran Byte Memori

Properti `length` pada teks string menghitung jumlah karakter visual atau kode UTF-16, bukan jumlah byte fisik yang sebenarnya saat disimpan ke dalam format UTF-8 (misalnya huruf beraksen atau emoji membutuhkan lebih dari 1 byte). Menyamakan keduanya saat mengalokasikan memori atau menyusun paket jaringan dapat menyebabkan teks terpotong (_truncated_).

> **Catatan:** Metode `buf.write(string)` digunakan untuk menuliskan teks string ke dalam alokasi memori buffer yang sudah disiapkan sebelumnya via `Buffer.alloc()`.

```javascript
// Salah: Mengalokasikan memori berdasarkan string.length
import { Buffer } from "node:buffer";

const title = "Café"; // Panjang karakter: 4, namun ukuran fisik UTF-8: 5 byte
const allocated = Buffer.alloc(title.length); // Alokasi hanya 4 byte
allocated.write(title);

console.log(allocated.toString("utf-8"));
// Output: Caf
// Keterangan: Karakter 'é' terpotong karena alokasi memori kurang 1 byte
```

```javascript
// Benar: Mengalokasikan memori berdasarkan Buffer.byteLength()
import { Buffer } from "node:buffer";

const title = "Café";
const byteSize = Buffer.byteLength(title, "utf-8"); // Ukuran byte fisik aktual: 5
const allocated = Buffer.alloc(byteSize); // Alokasi tepat 5 byte
allocated.write(title);

console.log(allocated.toString("utf-8"));
// Output: Café
```

### Membiarkan Residu Memori pada `Buffer.allocUnsafe()`

Menggunakan alokasi cepat yang tidak aman dan langsung mengirimkannya ke jaringan berisiko membocorkan data rahasia dari proses aplikasi lain yang sempat tersimpan di blok memori tersebut.

```javascript
// Salah
import { Buffer } from "node:buffer";

const buf = Buffer.allocUnsafe(64);
// Langsung dikirim tanpa ditimpa atau dibersihkan isinya
```

```javascript
// Benar
import { Buffer } from "node:buffer";

const buf = Buffer.alloc(64);
```

---

## Studi Kasus

Skenario: Membangun sistem validasi keamanan unggah berkas (_file upload security guard_) dengan teknik deteksi _Magic Bytes_ (tanda tangan biner). Sistem ini memverifikasi tipe MIME asli berkas dari header byte mentahnya untuk menggagalkan upaya peretasan yang menyamarkan skrip berbahaya lewat pemalsuan ekstensi berkas (misalnya skrip yang diganti nama menjadi `.png`).

```javascript
import { Buffer } from "node:buffer";

const FILE_SIGNATURES = {
  "89504e47": "image/png",
  ffd8ffe0: "image/jpeg",
  ffd8ffe1: "image/jpeg",
  25504446: "application/pdf",
};

function inspectFileType(fileBuffer) {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length < 4) {
    return { valid: false, mimeType: null, reason: "Invalid or empty buffer" };
  }

  // Mengambil 4 byte pertama (magic bytes) secara efisien tanpa menyalin memori baru
  const magicBytes = fileBuffer.subarray(0, 4).toString("hex");
  const detectedMime = FILE_SIGNATURES[magicBytes];

  if (!detectedMime) {
    return {
      valid: false,
      mimeType: null,
      reason: "Unknown or suspicious file signature",
    };
  }

  return { valid: true, mimeType: detectedMime, magicBytes };
}

// Simulasi 1: Berkas PNG valid (header biner: 89 50 4E 47)
const validPngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
console.log(inspectFileType(validPngBuffer));
// Output: { valid: true, mimeType: 'image/png', magicBytes: '89504e47' }

// Simulasi 2: Berkas skrip berbahaya yang dipalsukan ekstensinya menjadi foto
const fakePngBuffer = Buffer.from('<?php echo "exploit"; ?>', "utf-8");
console.log(inspectFileType(fakePngBuffer));
// Output:
// {
//   valid: false,
//   mimeType: null,
//   reason: 'Unknown or suspicious file signature'
// }
```

Mengapa pola ini menjadi standar industri backend? Di server produksi, peretas dapat dengan mudah memanipulasi nama berkas dan memalsukan header HTTP `Content-Type` dari sisi client. Memeriksa ekstensi saja membuka celah keamanan fatal (_Remote Code Execution_). Oleh karena itu, industri selalu menginspeksi beberapa byte pertama (_magic bytes signature_) langsung di tingkat biner memori menggunakan `Buffer.subarray()` dan representasi `hex` sebelum berkas diizinkan disimpan ke penyimpanan permanen.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `convertTextToHex(text)` yang menerima string teks dan mengembalikan representasi string heksadesimalnya menggunakan modul `node:buffer`.

Contoh input:

```javascript
console.log(convertTextToHex("Node"));
```

Contoh output yang diharapkan:

```javascript
// '4e6f6465'
```

Batasan: Gunakan `Buffer.from()` dengan format UTF-8 dan ekspor hasilnya ke format `'hex'`.

### Soal 2 (Menengah)

Buat fungsi `concatBinaryPackets(stringList)` yang menerima daftar array string teks, mengonversi setiap teks menjadi buffer dengan menyertakan karakter baris baru (`0x0A`) di akhir setiap elemen, lalu menyatukan seluruh potongan tersebut menjadi satu instance `Buffer` menggunakan `Buffer.concat()`.

Contoh input:

```javascript
console.log(concatBinaryPackets(["Alpha", "Beta"]));
```

Contoh output yang diharapkan:

```javascript
// <Buffer 41 6c 70 68 61 0a 42 65 74 61 0a>
```

Batasan: Gunakan fungsi `Buffer.concat()` dan pastikan nilai kembalian berupa instance `Buffer` murni.

### Soal 3 (Menantang)

Buat fungsi pengurai amplop paket data biner `parseBinaryPacket(packet)` yang memvalidasi header biner dan mengekstrak payload sesuai format encoding.

Struktur format bingkai data biner:

- Byte 0 (1 byte): Magic Byte penanda protokol (wajib bernilai heksadesimal `0xAA` atau angka desimal `170`).
- Byte 1 (1 byte): Kode format encoding (`1` untuk teks biasa UTF-8, `2` untuk teks Base64).
- Byte 2 (1 byte): Ukuran panjang data payload dalam satuan byte (`payloadLength`).
- Byte 3 sampai `3 + payloadLength`: Konten data payload mentah yang diambil menggunakan irisan `packet.subarray(3, 3 + payloadLength)`.

Aturan Penanganan Kondisi Khusus & Error (_Edge Cases_):

- Jika `packet` bukan instance `Buffer` (periksa dengan `Buffer.isBuffer()`) atau panjang totalnya kurang dari 3 byte (header tidak lengkap), kembalikan:
  `{ valid: false, reason: 'Invalid packet header' }`
- Jika byte ke-0 bukan `0xAA`, kembalikan:
  `{ valid: false, reason: 'Invalid magic byte' }`
- Jika panjang keseluruhan buffer (`packet.length`) kurang dari `3 + payloadLength` (data terpotong), kembalikan:
  `{ valid: false, reason: 'Truncated packet data' }`
- Jika byte ke-1 bernilai `1`: dekode payload menggunakan `toString('utf-8')` dan kembalikan:
  `{ valid: true, encoding: 'utf-8', data: '...' }`
- Jika byte ke-1 bernilai `2`: dekode payload menggunakan `toString('base64')` dan kembalikan:
  `{ valid: true, encoding: 'base64', data: '...' }`
- Jika byte ke-1 bukan bernilai `1` atau `2`, kembalikan:
  `{ valid: false, reason: 'Unsupported encoding' }`

Contoh input 1 (Kasus sukses - Teks UTF-8):

```javascript
const textPayload = Buffer.from("NodeJS", "utf-8");
const packet1 = Buffer.concat([
  Buffer.from([0xaa, 1, textPayload.length]),
  textPayload,
]);

console.log(parseBinaryPacket(packet1));
```

Contoh output 1 yang diharapkan:

```javascript
// { valid: true, encoding: 'utf-8', data: 'NodeJS' }
```

Contoh input 2 (Kasus sukses - Teks Base64):

```javascript
const b64Payload = Buffer.from("secret_token", "utf-8");
const packet2 = Buffer.concat([
  Buffer.from([0xaa, 2, b64Payload.length]),
  b64Payload,
]);

console.log(parseBinaryPacket(packet2));
```

Contoh output 2 yang diharapkan:

```javascript
// { valid: true, encoding: 'base64', data: 'c2VjcmV0X3Rva2Vu' }
```

Contoh input 3 (Kasus error - Magic Byte tidak cocok):

```javascript
const invalidMagicPacket = Buffer.from([0xff, 1, 0]);

console.log(parseBinaryPacket(invalidMagicPacket));
```

Contoh output 3 yang diharapkan:

```javascript
// { valid: false, reason: 'Invalid magic byte' }
```

Contoh input 4 (Kasus error - Data payload terpotong):

```javascript
// Header menyatakan payload 10 byte, namun hanya ada 2 byte fisik di buffer
const truncatedPacket = Buffer.from([0xaa, 1, 10, 0x48, 0x69]);

console.log(parseBinaryPacket(truncatedPacket));
```

Contoh output 4 yang diharapkan:

```javascript
// { valid: false, reason: 'Truncated packet data' }
```

Batasan: Dilarang menggunakan library eksternal. Gunakan metode resmi yang dipelajari pada bab ini seperti `Buffer.isBuffer()`, `Buffer.from()`, `Buffer.concat()`, `subarray()`, dan `toString()`.

---

## Navigasi

[Sebelumnya: Events](../08-events/README.md) | [Selanjutnya: Stream](../10-stream/README.md) | [Daftar Isi](../README.md)
