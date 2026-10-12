# Path

> Ringkasan
>
> - Fungsi: Menyediakan fungsi utilitas untuk memanipulasi, menormalisasi, mengekstrak komponen, dan menyelesaikan resolusi jalur sistem berkas lintas platform sistem operasi.
> - Digunakan saat: Menggabungkan jalur folder proyek, memvalidasi ekstensi unggahan berkas, menghitung navigasi impor relatif, dan memproteksi server dari serangan _path traversal_.
> - Aturan praktis: Jangan pernah menyambung segmen path secara manual dengan operator string plus; gunakan `path.posix` untuk kunci penyimpanan objek cloud dan selalu verifikasi batas keamanan jalur dengan `.startsWith()`.

---

## Tujuan Belajar

- Mengidentifikasi perbedaan karakter pemisah jalur direktori antara POSIX/Linux (`/`) dan Windows (`\`).
- Membedakan perilaku penggabungan jalur `path.join()` dengan resolusi absolut `path.resolve()`.
- Mengekstrak komponen anatomi berkas menggunakan `path.basename()`, `path.dirname()`, dan `path.extname()`.
- Menghitung jarak navigasi relatif antar-folder menggunakan `path.relative()`.
- Mengimplementasikan pola pertahanan terhadap celah keamanan siber _Path Traversal_ (CWE-22).

---

## Konsep

> Modul `node:path` dapat dianalogikan sebagai sistem penunjuk alamat dan pos gerbang keamanan di kawasan gedung perkantoran. Metode `path.join()` bertindak seperti petunjuk arah lokal ("dari lobi, naik ke lantai 2, belok ke ruang arsip"). Metode `path.resolve()` bekerja seperti koordinat satelit GPS absolut ("Jalan Merdeka No. 10, Menara Palma, Lantai 2, Ruang Arsip"). Pos gerbang keamanan bertugas memvalidasi pengunjung yang mencoba menyelundupkan tanda mundur keluar batas (`..`) agar tidak dapat menyusup ke instalasi penting di luar area yang diizinkan.

```mermaid
flowchart TD
    INPUT["Input Pengguna: '../../etc/passwd'"] --> RESOLVE["path.resolve(ROOT_DIR, '.' + path.sep + INPUT)"]
    RESOLVE --> CHECK{"safeTarget.startsWith(ROOT_DIR)?"}
    CHECK -- Ya (Aman) --> ALLOW["Izinkan Akses Berkas"]
    CHECK -- Tidak (Bahaya) --> BLOCK["Tolak Permintaan: 403 Forbidden"]
```

---

## Referensi

| Item                            | Fungsi                                                                        | Catatan                                                               |
| :------------------------------ | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **`path.join(...paths)`**       | Menggabungkan segmen-segmen jalur dan merapikan segmen `.` atau `..`          | Mempertahankan status relatif atau absolut sesuai segmen pembuka      |
| **`path.resolve(...paths)`**    | Mengkalkulasi jalur absolut fisik dari kanan ke kiri                          | Selalu menghasilkan jalur absolut yang terikat pada `process.cwd()`   |
| **`path.basename(path, [ext])`**| Mengambil nama berkas terakhir dari string jalur                              | Dapat menghapus ekstensi jika argumen kedua diberikan                 |
| **`path.dirname(path)`**        | Mengambil jalur direktori induk yang menaungi berkas                          | Membuang komponen nama berkas terakhir                                |
| **`path.extname(path)`**        | Mengambil ekstensi berkas lengkap beserta tanda titiknya                      | Mengembalikan string kosong jika berkas tidak memiliki ekstensi       |
| **`path.relative(from, to)`**   | Menghitung langkah rute navigasi relatif dari satu lokasi ke lokasi tujuan    | Berguna untuk menyusun baris pernyataan impor modul otomatis          |
| **`path.normalize(path)`**      | Merapikan tanda garis miring ganda dan segmen relatif pada string jalur       | Menstandarkan representasi jalur tanpa mengubah status absolutnya     |
| **`path.isAbsolute(path)`**     | Memeriksa apakah suatu string jalur berstatus absolut atau relatif            | Mengembalikan nilai boolean `true` atau `false`                       |
| **`path.parse(path)`**          | Membedah string jalur menjadi objek struktur anatomi berkas                   | Menghasilkan objek `{ root, dir, base, ext, name }`                   |
| **`path.format(obj)`**          | Menyusun kembali objek struktur anatomi berkas menjadi string jalur utuh      | Operasi kebalikan dari `path.parse()`                                 |
| **`path.posix`**                | Memaksa seluruh operasi manipulasi jalur mengikuti standar POSIX (`/`)        | Menjamin konsistensi pemisah slash untuk URL web dan AWS S3 Object    |

### `path.join(...paths)`

Metode `path.join()` menggabungkan seluruh segmen jalur yang diberikan dan menormalisasi segmen navigasi seperti `.` atau `..`. Metode ini mempertahankan status jalur relatif jika segmen pertama tidak diawali slash absolut.

```javascript
import path from "node:path";

const jalur = path.join("/app", "src", "controllers", "..", "models", "user.js");
console.log(jalur);
// Output: /app/src/models/user.js
```

Kasus lain: Menggabungkan beberapa segmen string kosong menghasilkan tanda titik tunggal yang merepresentasikan direktori saat ini.

```javascript
import path from "node:path";

const hasil = path.join("", "");
console.log(hasil);
// Output: .
```

### `path.resolve(...paths)`

Metode `path.resolve()` memproses urutan jalur dari kanan ke kiri hingga menemukan jalur absolut. Jika seluruh parameter bersifat relatif, metode ini akan menyambungkannya ke direktori kerja terminal saat ini (`process.cwd()`).

```javascript
import path from "node:path";

const absolut = path.resolve("/var/log", "app", "server.log");
console.log(absolut);
// Output: /var/log/app/server.log
```

Kasus lain: Segmen yang diawali tanda slash root di tengah parameter akan mereset seluruh segmen di sebelah kirinya.

```javascript
import path from "node:path";

const tereset = path.resolve("folderA", "/folderB", "berkas.txt");
console.log(tereset);
// Output: /folderB/berkas.txt
```

### `path.basename(path, [ext])`

Metode `path.basename()` mengekstrak segmen terakhir dari sebuah jalur berkas. Jika parameter kedua disertakan, ekstensi yang cocok akan dibuang dari hasil akhir.

```javascript
import path from "node:path";

const berkasLengkap = path.basename("/var/www/uploads/avatar.png");
console.log(berkasLengkap);
// Output: avatar.png

const namaMurni = path.basename("/var/www/uploads/avatar.png", ".png");
console.log(namaMurni);
// Output: avatar
```

Kasus lain: Menghapus trailing slash sebelum membaca nama berkas terakhir secara otomatis.

```javascript
import path from "node:path";

const folder = path.basename("/var/www/uploads/");
console.log(folder);
// Output: uploads
```

### `path.dirname(path)`

Metode `path.dirname()` mengembalikan jalur direktori induk tempat suatu berkas berada dengan membuang segmen nama berkas terakhir.

```javascript
import path from "node:path";

const induk = path.dirname("/var/www/uploads/avatar.png");
console.log(induk);
// Output: /var/www/uploads
```

Kasus lain: Memanggil `path.dirname()` pada jalur akar mengembalikan tanda akar yang sama.

```javascript
import path from "node:path";

const akar = path.dirname("/");
console.log(akar);
// Output: /
```

### `path.extname(path)`

Metode `path.extname()` mengekstrak ekstensi berkas mulai dari tanda titik terakhir pada komponen nama berkas.

```javascript
import path from "node:path";

const ekstensi = path.extname("laporan-keuangan.pdf");
console.log(ekstensi);
// Output: .pdf
```

Kasus lain: Berkas tanpa titik atau berkas titik tersembunyi tanpa ekstensi lanjutan mengembalikan string kosong.

```javascript
import path from "node:path";

console.log(path.extname(".gitignore") === "");
// Output: true
console.log(path.extname("Dockerfile") === "");
// Output: true
```

### `path.relative(from, to)`

Metode `path.relative()` menghitung jalur navigasi relatif dari direktori pangkal (`from`) menuju lokasi target (`to`).

```javascript
import path from "node:path";

const navigasi = path.relative("/app/src/controllers", "/app/assets/logo.png");
console.log(navigasi);
// Output: ../../assets/logo.png
```

Kasus lain: Jika kedua jalur merujuk ke lokasi yang sama persis, metode ini mengembalikan string kosong.

```javascript
import path from "node:path";

const sama = path.relative("/app/src", "/app/src");
console.log(sama === "");
// Output: true
```

### `path.normalize(path)`

Metode `path.normalize()` merapikan string jalur yang memuat pemisah ganda redundan dan menyelesaikan segmen relatif `.` atau `..`.

```javascript
import path from "node:path";

const bersih = path.normalize("/var//log/../log/audit//app.log");
console.log(bersih);
// Output: /var/log/audit/app.log
```

Kasus lain: Jalur relatif yang memuat navigasi berlebih tetap dipertahankan format relatifnya.

```javascript
import path from "node:path";

const relatif = path.normalize("src/../dist/index.js");
console.log(relatif);
// Output: dist/index.js
```

### `path.isAbsolute(path)`

Metode `path.isAbsolute()` memeriksa apakah suatu string jalur berstatus absolut terhadap sistem operasi aktif.

```javascript
import path from "node:path";

console.log(path.isAbsolute("/var/log"));
// Output: true
console.log(path.isAbsolute("./config.json"));
// Output: false
```

Kasus lain: Memeriksa string kosong mengembalikan `false`.

```javascript
import path from "node:path";

console.log(path.isAbsolute(""));
// Output: false
```

### `path.parse(path)`

Metode `path.parse()` memecah string jalur menjadi objek struktur data yang memisahkan bagian root, direktori, nama dasar, ekstensi, dan nama tanpa ekstensi.

```javascript
import path from "node:path";

const komponen = path.parse("/var/www/avatar.png");
console.log(komponen.dir);
// Output: /var/www
console.log(komponen.base);
// Output: avatar.png
console.log(komponen.name);
// Output: avatar
console.log(komponen.ext);
// Output: .png
```

Kasus lain: Parsing jalur relatif menghasilkan properti `root` berupa string kosong.

```javascript
import path from "node:path";

const relatif = path.parse("data/pengguna.json");
console.log(relatif.root === "");
// Output: true
```

### `path.format(obj)`

Metode `path.format()` merekonstruksi objek komponen anatomi berkas kembali menjadi representasi string jalur yang utuh.

```javascript
import path from "node:path";

const jalurBaru = path.format({
  dir: "/var/www",
  base: "avatar.webp",
});
console.log(jalurBaru);
// Output: /var/www/avatar.webp
```

Kasus lain: Jika properti `base` tidak disediakan, fungsi akan menggabungkan properti `name` dan `ext`.

```javascript
import path from "node:path";

const rekonstruksi = path.format({
  dir: "/opt/app",
  name: "server",
  ext: ".js",
});
console.log(rekonstruksi);
// Output: /opt/app/server.js
```

### `path.posix`

Objek modul `path.posix` menyediakan seluruh antarmuka modul `path` yang dipaksa menggunakan standar pemisah slash POSIX (`/`), terlepas dari apakah aplikasi sedang berjalan di Windows atau Linux.

```javascript
import path from "node:path";

const kunciS3 = path.posix.join("uploads", "2026", "foto.png");
console.log(kunciS3);
// Output: uploads/2026/foto.png
```

Kasus lain: Menggunakan `path.posix.normalize` untuk merapikan string URL web yang memuat backslash.

```javascript
import path from "node:path";

const urlPath = path.posix.normalize("assets/styles/main.css");
console.log(urlPath);
// Output: assets/styles/main.css
```

### Perbandingan: `path.join()` vs `path.resolve()`

| Karakteristik | `path.join()` | `path.resolve()` |
| :--- | :--- | :--- |
| **Sifat Luaran** | Mengikuti masukan (relatif atau absolut) | Selalu absolut (dimulai `/` atau huruf drive) |
| **Keterikatan Direktori Kerja** | Tidak terikat pada `process.cwd()` | Terikat ke `process.cwd()` jika masukan relatif |
| **Reaksi Karakter Root di Tengah** | Dianggap sebagai segmen biasa tanpa mereset | Mereset seluruh segmen di sebelah kirinya |

---

## Kesalahan Umum

### Menyambung Jalur Berkas Menggunakan Operator String Plus

Menyambung jalur secara manual dengan tanda `+ '/'` menyebabkan inkonsistensi pemisah direktori dan kegagalan sistem berkas ketika dipindahkan ke Windows.

```javascript
// Salah
const jalur = folderInduk + "/" + namaBerkas;
```

```javascript
// Benar
import path from "node:path";
const jalur = path.join(folderInduk, namaBerkas);
```

### Mengira `path.join()` Kebal Serangan Path Traversal

Metode `path.join()` hanya merapikan format titik mundur tanpa memvalidasi apakah hasil akhir telah keluar dari direktori publik yang diizinkan.

```javascript
// Salah
const direktoriPublik = "/var/www/public";
const target = path.join(direktoriPublik, "../../etc/passwd");
// target bernilai "/var/etc/passwd" yang membocorkan berkas sistem!
```

```javascript
// Benar
import path from "node:path";
const direktoriPublik = "/var/www/public";
const targetAman = path.resolve(direktoriPublik, "." + path.sep + "../../etc/passwd");
const adalahAman = targetAman.startsWith(direktoriPublik);
// adalahAman bernilai false sehingga permintaan dapat ditolak
```

### Lupa Menormalkan Huruf Kecil pada Ekstensi Berkas

Ekstensi berkas dari kamera atau sistem operasi tertentu sering menggunakan huruf kapital seperti `.JPG` atau `.PNG` yang dapat menggagalkan validasi daftar putih.

```javascript
// Salah
const ext = path.extname("foto.JPG");
const valid = [".jpg", ".png"].includes(ext); // false
```

```javascript
// Benar
import path from "node:path";
const ext = path.extname("foto.JPG").toLowerCase();
const valid = [".jpg", ".png"].includes(ext); // true
```

---

## Studi Kasus

Skenario: Membangun penyimpan berkas unggahan aman (_secure file upload handler_) yang memvalidasi ekstensi dalam format huruf kecil, mencegah eksploitasi _path traversal_, dan mengonstruksi kunci penyimpanan cloud POSIX yang kompatibel dengan protokol AWS S3.

```javascript
import path from "node:path";

class SecureStorage {
  constructor(folderRoot) {
    this.folderRoot = path.resolve(folderRoot);
    this.daftarEkstensiDiizinkan = new Set([".png", ".jpg", ".jpeg", ".pdf"]);
  }

  simpanLokal(namaBerkasInput, idUnik) {
    const ext = path.extname(namaBerkasInput).toLowerCase();

    if (!this.daftarEkstensiDiizinkan.has(ext)) {
      return { sukses: false, alasan: "Ekstensi berkas tidak diizinkan" };
    }

    const namaAman = `${idUnik}${ext}`;
    const targetAbsolut = path.resolve(this.folderRoot, "." + path.sep + namaAman);

    if (!targetAbsolut.startsWith(this.folderRoot)) {
      return { sukses: false, alasan: "Percobaan path traversal terdeteksi" };
    }

    return {
      sukses: true,
      jalurLokal: targetAbsolut,
      kunciCloud: path.posix.join("dokumen", "2026", namaAman),
    };
  }
}

const storage = new SecureStorage("/var/data/uploads");

const hasilValid = storage.simpanLokal("laporan.PDF", "uuid-1234");
console.log(hasilValid.sukses);
// Output: true
console.log(hasilValid.jalurLokal.endsWith("uuid-1234.pdf"));
// Output: true
console.log(hasilValid.kunciCloud);
// Output: dokumen/2026/uuid-1234.pdf

const hasilIlegal = storage.simpanLokal("script.exe", "uuid-5678");
console.log(hasilIlegal.sukses);
// Output: false
console.log(hasilIlegal.alasan);
// Output: Ekstensi berkas tidak diizinkan
```

Desain ini menggunakan kombinasi `path.resolve()`, `path.extname().toLowerCase()`, pengecekan batasan `.startsWith()`, dan `path.posix.join()` untuk menjaga keamanan penyimpanan lokal maupun cloud tanpa pustaka tambahan.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `uraiKomponenBerkas(jalurBerkas)` yang menerima string jalur berkas dan mengembalikan objek ringkas berisi nama berkas lengkap (`base`), nama murni tanpa ekstensi (`name`), ekstensi dalam format huruf kecil (`ext`), dan nama direktori induk (`dir`).

Contoh masukan:

```javascript
uraiKomponenBerkas("/var/log/audit/SERVER-PROD.LOG");
```

Contoh keluaran yang diharapkan:

```javascript
{
  base: 'SERVER-PROD.LOG',
  name: 'SERVER-PROD',
  ext: '.log',
  dir: '/var/log/audit'
}
```

Batasan: Gunakan modul bawaan `node:path`. Nilai `ext` wajib dinormalkan ke huruf kecil.

### Soal 2 (Menengah)

Buat fungsi `ubahEkstensiBerkas(jalurLama, ekstensiBaru)` yang menerima jalur berkas asal dan string ekstensi baru (misalnya `'.webp'`). Fungsi ini wajib membedah jalur menggunakan `path.parse()`, memperbarui komponen ekstensi dengan ekstensi baru, dan merekonstruksinya kembali menggunakan `path.format()` tanpa menghilangkan struktur direktori asalnya.

Contoh masukan:

```javascript
ubahEkstensiBerkas("/assets/images/banner.png", ".webp");
```

Contoh keluaran yang diharapkan:

```javascript
/assets/images/banner.webp
```

Batasan: Wajib menggunakan `path.parse()` dan `path.format()`. Pastikan ekstensi baru selalu diawali tanda titik jika pengguna lupa menyertakannya.

### Soal 3 (Menantang)

Buat fungsi pelindung berkas `validasiAksesUnduh(direktoriAkar, masukanPengguna, daftarEkstensiDiizinkan)` yang memvalidasi permintaan unduhan berkas pengguna terhadap ancaman keamanan siber _Directory Traversal_.

Ketentuan fungsional:

1. Resolusikan `direktoriAkar` menjadi jalur absolut utuh menggunakan `path.resolve()`.
2. Jika `masukanPengguna` kosong, hanya berisi spasi, atau bukan string, kembalikan `{ diizinkan: false, status: 400, pesan: 'Nama berkas tidak valid' }`.
3. Konstruksikan target jalur aman menggunakan pola resolusi defensif: `path.resolve(akarAbsolut, '.' + path.sep + masukanPengguna)`.
4. Periksa apakah target hasil resolusi berada di bawah `akarAbsolut` menggunakan `.startsWith(akarAbsolut)`. Jika berada di luar batas direktori, kembalikan `{ diizinkan: false, status: 403, pesan: 'Akses direktori ditolak' }`.
5. Ekstrak ekstensi berkas target dan periksa apakah termasuk dalam larik `daftarEkstensiDiizinkan` (pencocokan tidak boleh sensitif huruf kapital). Jika tidak terdaftar, kembalikan `{ diizinkan: false, status: 415, pesan: 'Tipe berkas tidak didukung' }`.
6. Jika semua uji keamanan lolos, kembalikan `{ diizinkan: true, status: 200, jalurAbsolut: string }`.

Contoh masukan 1 (Permintaan aman):

```javascript
validasiAksesUnduh("/var/public", "laporan/keuangan.pdf", [".pdf", ".xlsx"]);
```

Contoh keluaran 1:

```javascript
{
  diizinkan: true,
  status: 200,
  jalurAbsolut: '/var/public/laporan/keuangan.pdf'
}
```

Contoh masukan 2 (Serangan Traversal):

```javascript
validasiAksesUnduh("/var/public", "../../etc/shadow", [".pdf"]);
```

Contoh keluaran 2:

```javascript
{
  diizinkan: false,
  status: 403,
  pesan: 'Akses direktori ditolak'
}
```

Contoh masukan 3 (Ekstensi tidak diizinkan):

```javascript
validasiAksesUnduh("/var/public", "data.exe", [".pdf", ".xlsx"]);
```

Contoh keluaran 3:

```javascript
{
  diizinkan: false,
  status: 415,
  pesan: 'Tipe berkas tidak didukung'
}
```

Batasan: Dilarang menggunakan pustaka pihak ketiga. Wajib menangani perbedaan separator sistem operasi dan memastikan seluruh celah navigasi relatif ternetralisasi.

---

## Navigasi

[Sebelumnya: OS](../04-os/README.md) | [Selanjutnya: URL](../06-url/README.md) | [Daftar Isi](../README.md)
