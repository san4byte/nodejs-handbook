# URL

> Ringkasan
> - Fungsi: Mengurai, memvalidasi, menyusun, dan memanipulasi alamat web (URL) serta parameter kueri sesuai standar internasional WHATWG URL API.
> - Digunakan saat: Membaca parameter pencarian, menggabungkan endpoint API dengan basis URL, mencegah celah pengalihan berbahaya (_open redirect_), dan mengonversi format tautan berkas sistem.
> - Aturan praktis: Hindari penggunaan fungsi usang `url.parse()` karena memiliki kerentanan manipulasi keamanan (SSRF); gunakan kelas bawaan `URL` dan `URLSearchParams` yang tersedia secara global.

---

## Tujuan Belajar

- Mengidentifikasi komponen penyusun URL standar WHATWG (`origin`, `protocol`, `host`, `pathname`, `search`).
- Memanipulasi parameter string kueri menggunakan metode pada antarmuka `URLSearchParams`.
- Membedakan dampak penggunaan metode `.set()` versus `.append()` serta `.get()` versus `.getAll()`.
- Mengonversi format URL berkas (`file://`) ke jalur sistem berkas fisik menggunakan `fileURLToPath` dan sebaliknya dengan `pathToFileURL`.
- Mengimplementasikan pola pengalihan aman untuk mencegah eksploitasi kerentanan _Open Redirect_.

---

## Konsep

> Alamat URL dapat dianalogikan sebagai label pengiriman paket ekspres internasional: `https://api.toko.com:8080/v1/produk?kategori=elektronik#stok`. Komponen protokol (`https:`) adalah jenis armada kurir berizin resmi. Komponen nama host (`api.toko.com`) dan port (`:8080`) adalah alamat gedung pergudangan beserta nomor gerbang masuknya. Komponen jalur rute (`/v1/produk`) adalah nomor lorong rak tempat barang diletakkan. Komponen parameter kueri (`?kategori=elektronik`) adalah lembar spesifikasi instruksi pemilahan barang yang diminta. Fragmen pagar (`#stok`) adalah penanda tab catatan pada dokumen kerja kurir.

```mermaid
flowchart LR
    INPUT["String URL Masukan"] --> PARSER["new URL(input, [base])"]
    PARSER --> ORIGIN["Origin: protocol + // + host"]
    PARSER --> PATH["Pathname: /v1/products"]
    PARSER --> QUERY["searchParams (URLSearchParams)"]
    QUERY --> GET["params.get() / params.getAll()"]
    QUERY --> SET["params.set() / params.append()"]
```

---

## Referensi

| Item | Fungsi | Catatan |
| :--- | :--- | :--- |
| **`new URL(input, [base])`** | Mengurai string alamat web menjadi instance objek URL standar WHATWG | Melempar `TypeError` jika format URL tidak valid atau basis hilang |
| **`url.origin`** | Mengembalikan gabungan skema protokol, domain, dan nomor port | Bersifat hanya-baca, sangat krusial untuk validasi CORS dan keamanan |
| **`url.pathname`** | Mengembalikan hierarki jalur rute berkas yang selalu diawali tanda slash | Otomatis bernilai `'/'` jika tidak ada rute yang didefinisikan |
| **`url.searchParams`** | Mengakses instance utilitas untuk manipulasi kueri URL secara dinamis | Terhubung secara reaktif dengan nilai `url.search` dan `url.href` |
| **`searchParams.get(name)`** | Mengambil nilai pertama yang cocok dengan nama parameter kueri | Mengembalikan string nilai atau `null` jika parameter tidak ditemukan |
| **`searchParams.getAll(name)`** | Mengambil seluruh nilai yang cocok dengan nama parameter kueri | Mengembalikan larik string untuk menangani kueri multi-nilai |
| **`searchParams.set(name, value)`** | Menetapkan nilai baru dan menimpa seluruh entri nilai kunci sebelumnya | Bersifat idempoten untuk memperbarui parameter tunggal |
| **`searchParams.append(name, value)`** | Menambahkan pasangan kunci dan nilai baru ke dalam daftar kueri | Mempertahankan nilai lama untuk mendukung parameter berulang |
| **`fileURLToPath(url)`** | Mengonversi URL format `file://` menjadi representasi jalur sistem berkas | Menyesuaikan separator direktori sistem operasi aktif secara otomatis |
| **`pathToFileURL(path)`** | Mengonversi jalur sistem berkas absolut menjadi URL format `file://` | Mengodekan karakter spasi dan simbol khusus secara otomatis |

### `new URL(input, [base])`

Konstruktor `new URL()` membedah string alamat web menjadi objek URL standar. Jika masukan berupa URL relatif, argumen kedua `base` wajib disertakan sebagai titik acuan resolusi.

```javascript
const targetUrl = new URL('/v1/users', 'https://api.example.com');
console.log(targetUrl.href);
// Output: https://api.example.com/v1/users
```

Kasus lain: Melempar `TypeError` berkode `ERR_INVALID_URL` jika string masukan bukan merupakan format URL yang valid atau kekurangan basis.

```javascript
try {
  new URL('path-without-base');
} catch (error) {
  console.log(error.code);
  // Output: ERR_INVALID_URL
}
```

### `url.origin`

Properti `url.origin` mengembalikan kombinasi protokol, nama domain, dan port. Properti ini bersifat baca-saja dan sering digunakan untuk memverifikasi domain asal permintaan pada proteksi CORS atau pengalihan rute.

```javascript
const targetUrl = new URL('https://example.com:8080/catalog?page=1');
console.log(targetUrl.origin);
// Output: https://example.com:8080
```

Kasus lain: URL dengan protokol non-jaringan seperti `file:` atau `blob:` menghasilkan origin khusus atau string `'null'`.

```javascript
const fileUrl = new URL('file:///app/index.js');
console.log(fileUrl.origin);
// Output: null
```

### `url.pathname`

Properti `url.pathname` menyimpan jalur rute hierarki sumber daya. Properti ini selalu diawali garis miring pembuka `/`, bahkan jika URL masukan dibuat tanpa mencantumkan path spesifik.

```javascript
const domainUrl = new URL('https://example.com');
console.log(domainUrl.pathname);
// Output: /
```

Kasus lain: Mengubah nilai properti `pathname` akan memperbarui properti `href` secara otomatis seketika.

```javascript
const targetUrl = new URL('https://example.com/start');
targetUrl.pathname = '/end';
console.log(targetUrl.href);
// Output: https://example.com/end
```

### `url.searchParams`

Properti `url.searchParams` mengembalikan objek instance `URLSearchParams` yang mengikat parameter kueri secara dua arah dengan URL induknya.

```javascript
const targetUrl = new URL('https://api.example.com?sort=latest');
console.log(targetUrl.searchParams.get('sort'));
// Output: latest
```

Kasus lain: Menghapus seluruh parameter dari `searchParams` otomatis membersihkan tanda tanya pada properti `search`.

```javascript
const targetUrl = new URL('https://api.example.com?sort=latest');
targetUrl.searchParams.delete('sort');
console.log(targetUrl.search === '');
// Output: true
```

### `searchParams.get(name)`

Metode `searchParams.get()` membaca nilai pertama yang terdaftar untuk parameter tertentu. Jika parameter tidak ditemukan pada kueri, metode ini mengembalikan `null`.

```javascript
const searchParams = new URLSearchParams('category=books&page=2');
console.log(searchParams.get('category'));
// Output: books
console.log(searchParams.get('price'));
// Output: null
```

Kasus lain: Mengambil parameter yang hanya memiliki nama tanpa tanda sama dengan menghasilkan string kosong, bukan `null`.

```javascript
const searchParams = new URLSearchParams('active');
console.log(searchParams.get('active') === '');
// Output: true
```

### `searchParams.getAll(name)`

Metode `searchParams.getAll()` mengumpulkan seluruh nilai yang memiliki nama parameter sama ke dalam bentuk larik string.

```javascript
const searchParams = new URLSearchParams('color=red&color=blue&color=green');
const colors = searchParams.getAll('color');

console.log(colors);
// Output: [ 'red', 'blue', 'green' ]
```

Kasus lain: Jika parameter yang diminta tidak ada, metode mengembalikan larik kosong tanpa galat.

```javascript
const searchParams = new URLSearchParams('color=red');
console.log(searchParams.getAll('size'));
// Output: []
```

### `searchParams.set(name, value)`

Metode `searchParams.set()` menetapkan nilai baru untuk suatu parameter. Jika parameter tersebut sebelumnya memiliki beberapa nilai duplikat, metode ini akan menghapus seluruh duplikat dan menyisakan satu nilai baru.

```javascript
const searchParams = new URLSearchParams('tag=js&tag=node');
searchParams.set('tag', 'express');

console.log(searchParams.toString());
// Output: tag=express
```

Kasus lain: Menetapkan nilai yang memuat karakter khusus atau emoji otomatis disandikan ke format URL encoding.

```javascript
const searchParams = new URLSearchParams();
searchParams.set('query', 'coffee & milk');
console.log(searchParams.toString());
// Output: query=coffee+%26+milk
```

### `searchParams.append(name, value)`

Metode `searchParams.append()` menambahkan pasangan kunci dan nilai baru ke bagian akhir kueri tanpa menghapus nilai yang sudah ada sebelumnya.

```javascript
const searchParams = new URLSearchParams('category=food');
searchParams.append('category', 'beverages');

console.log(searchParams.toString());
// Output: category=food&category=beverages
```

Kasus lain: Menambahkan parameter berkali-kali mempertahankan urutan pendaftaran nilai sesuai waktu pemanggilan.

```javascript
const searchParams = new URLSearchParams();
searchParams.append('number', '1');
searchParams.append('number', '2');
console.log(searchParams.getAll('number').join('-'));
// Output: 1-2
```

### `fileURLToPath(url)`

Fungsi `fileURLToPath()` mengonversi string atau instance URL berformat `file://` menjadi representasi jalur sistem berkas yang kompatibel dengan platform operasi aktif.

```javascript
import { fileURLToPath } from 'node:url';

const filePath = fileURLToPath('file:///var/log/audit.log');
console.log(filePath);
// Output: /var/log/audit.log
```

Kasus lain: Melempar `TypeError` berkode `ERR_INVALID_URL_SCHEME` jika URL masukan tidak menggunakan protokol `file:`.

```javascript
import { fileURLToPath } from 'node:url';

try {
  fileURLToPath('https://example.com/app.js');
} catch (error) {
  console.log(error.code);
  // Output: ERR_INVALID_URL_SCHEME
}
```

### `pathToFileURL(path)`

Fungsi `pathToFileURL()` mengonversi string jalur berkas absolut dari sistem operasi menjadi instance URL berformat `file://`.

```javascript
import { pathToFileURL } from 'node:url';

const fileUrl = pathToFileURL('/var/log/audit.log');
console.log(fileUrl.href);
// Output: file:///var/log/audit.log
```

Kasus lain: Spasi dan karakter khusus pada nama berkas diubah secara otomatis menjadi bentuk persen-encoding.

```javascript
import { pathToFileURL } from 'node:url';

const spacedUrl = pathToFileURL('/data/financial report.pdf');
console.log(spacedUrl.href.includes('financial%20report.pdf'));
// Output: true
```

### Perbandingan: Manipulasi Nilai Kueri

| Karakteristik | `searchParams.set()` | `searchParams.append()` |
| :--- | :--- | :--- |
| **Sifat Operasi** | Menimpa (Idempoten) | Menambah di akhir |
| **Dampak Nilai Duplikat** | Menghapus seluruh duplikat lama | Mempertahankan seluruh nilai sebelumnya |
| **Kasus Penggunaan Khas** | Memperbarui filter tunggal (misal `page=2`) | Menambah filter multi-pilihan (misal `tag=a&tag=b`) |

---

## Kesalahan Umum

### Menggunakan URL Relatif pada `new URL()` Tanpa Basis

Membuat objek `new URL()` dengan jalur relatif tanpa menyertakan argumen kedua memicu kegagalan fatal runtime `ERR_INVALID_URL`.

```javascript
// Salah
const targetUrl = new URL('/api/users');
```

```javascript
// Benar
const targetUrl = new URL('/api/users', 'https://api.example.com');
```

### Terjebak Pemotongan Jalur Akibat Garis Miring Pembuka (*Slash Truncation*)

Jika endpoint relatif diawali garis miring `/`, resolusi URL akan memotong seluruh hierarki path pada base URL dan kembali langsung ke domain root.

```javascript
// Salah
const baseUrl = 'https://api.example.com/v1/auth';
const targetUrl = new URL('/login', baseUrl);
console.log(targetUrl.href);
// Hasilnya: "https://api.example.com/login" (segmen /v1/auth hilang!)
```

```javascript
// Benar
const baseUrl = 'https://api.example.com/v1/auth/';
const targetUrl = new URL('login', baseUrl);
console.log(targetUrl.href);
// Hasilnya: "https://api.example.com/v1/auth/login"
```

### Menggunakan Modul Usang `url.parse()` yang Rentan Celah SSRF

Fungsi lama `url.parse()` memiliki cacat perancangan penguraian karakter khusus hostname yang dapat dimanipulasi oleh penyerang untuk mengelabui filter firewall server.

```javascript
// Salah
import url from 'node:url';
const parsed = url.parse('https://example.com/path');
```

```javascript
// Benar
const parsed = new URL('https://example.com/path');
```

---

## Studi Kasus

Skenario: Membangun pembangun permintaan API aman (_secure API client builder_) yang menyambungkan endpoint ke basis URL tanpa risiko pemotongan jalur, menangani parameter kueri skalar maupun larik, mengurutkan parameter kueri secara alfabetis untuk pembuatan tanda tangan HMAC, serta memvalidasi pengalihan agar kebal serangan _Open Redirect_.

```javascript
class ApiRequestBuilder {
  constructor(trustedBaseUrl) {
    this.baseUrl = new URL(trustedBaseUrl);
  }

  buildUrl(endpoint, parameters = {}) {
    const cleanBase = this.baseUrl.href.endsWith('/')
      ? this.baseUrl.href
      : `${this.baseUrl.href}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    const targetUrl = new URL(cleanEndpoint, cleanBase);

    for (const [key, value] of Object.entries(parameters)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          targetUrl.searchParams.append(key, String(item));
        }
      } else if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    }

    targetUrl.searchParams.sort();
    return targetUrl;
  }

  validateSafeRedirect(userRedirectUrl) {
    try {
      const target = new URL(userRedirectUrl, this.baseUrl.origin);
      if (target.origin !== this.baseUrl.origin) {
        return { isSafe: false, redirectPath: '/dashboard' };
      }
      return { isSafe: true, redirectPath: target.pathname + target.search };
    } catch {
      return { isSafe: false, redirectPath: '/dashboard' };
    }
  }
}

const builder = new ApiRequestBuilder('https://api.example.com/v1');

const requestUrl = builder.buildUrl('users', {
  role: 'admin',
  tags: ['nodejs', 'security'],
});
console.log(requestUrl.pathname);
// Output: /v1/users
console.log(requestUrl.search);
// Output: ?role=admin&tags=nodejs&tags=security

const safeCheck = builder.validateSafeRedirect('/profile?tab=security');
console.log(safeCheck.isSafe);
// Output: true
console.log(safeCheck.redirectPath);
// Output: /profile?tab=security

const phishingCheck = builder.validateSafeRedirect('https://malicious-site.com/login');
console.log(phishingCheck.isSafe);
// Output: false
console.log(phishingCheck.redirectPath);
// Output: /dashboard
```

Desain ini memanfaatkan kelas bawaan `URL` dan `URLSearchParams` dengan normalisasi trailing slash defensif serta verifikasi pencocokan properti `origin` untuk memastikan integritas koneksi dan keamanan siber aplikasi.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `parseDomainComponents(rawUrl)` yang menerima string URL utuh dan mengembalikan objek ringkas berisi nama domain bersih (`hostname`), nomor port (`port`), dan skema protokol (`protocol`). Jika port tidak dicantumkan secara eksplisit, tentukan port bawaan (80 untuk `'http:'`, 443 untuk `'https:'`).

Contoh masukan 1:
```javascript
parseDomainComponents('https://api.example.com:8443/v1');
```

Contoh keluaran 1:
```javascript
{
  hostname: 'api.example.com',
  port: 8443,
  protocol: 'https:'
}
```

Contoh masukan 2:
```javascript
parseDomainComponents('https://example.com/home');
```

Contoh keluaran 2:
```javascript
{
  hostname: 'example.com',
  port: 443,
  protocol: 'https:'
}
```

Batasan: Gunakan kelas `new URL()` bawaan. Nomor port pada objek keluaran wajib bertipe data angka (`number`).

### Soal 2 (Menengah)

Buat fungsi `extractSearchParams(rawUrl)` yang menerima sebuah string URL lengkap dan mengekstrak parameter kuerinya ke dalam bentuk objek biasa. Jika suatu parameter muncul lebih dari satu kali, simpan seluruh nilainya dalam bentuk larik string; jika hanya muncul satu kali, simpan sebagai string tunggal.

Contoh masukan:
```javascript
extractSearchParams('https://shop.example.com/products?category=electronics&color=red&color=black&page=1');
```

Contoh keluaran yang diharapkan:
```javascript
{
  category: 'electronics',
  color: ['red', 'black'],
  page: '1'
}
```

Batasan: Wajib memanfaatkan properti `url.searchParams`, metode `.getAll()`, dan metode iterasi bawaan `URLSearchParams` tanpa pustaka eksternal.

### Soal 3 (Menantang)

Buat fungsi pembangun dan pemvalidasi URL webhook `buildWebhookUrl(baseUrl, route, queryParams, allowedDomains)` dengan ketentuan keamanan ketat:

1. Periksa `baseUrl` dan `route`. Gabungkan keduanya tanpa memicu pemotongan jalur (_slash truncation trap_) dan hasilkan objek instance `URL`.
2. Validasi apakah `resultUrl.hostname` terdapat di dalam larik `allowedDomains`. Jika domain tidak terdaftar atau protokol bukan `'https:'`, kembalikan `{ success: false, reason: 'Domain or protocol not allowed' }`.
3. Tambahkan seluruh `queryParams` ke dalam `searchParams`. Jika nilai berupa larik, gunakan `.append()`. Jika skalar, gunakan `.set()`. Abaikan nilai yang bernilai `null` atau `undefined`.
4. Urutkan seluruh parameter secara alfabetis menggunakan `searchParams.sort()`.
5. Hitung panjang total string URL akhir yang dihasilkan (`href.length`). Jika panjang URL melebihi batas 2048 karakter, batalkan dan kembalikan `{ success: false, reason: 'URL length exceeds maximum limit of 2048 characters' }`.
6. Jika seluruh aturan terpenuhi, kembalikan objek `{ success: true, fullUrl: string, paramCount: number }`.

Contoh masukan 1 (Sukses):
```javascript
buildWebhookUrl(
  'https://webhook.partner.com/api/v2',
  'transactions',
  { status: 'success', tags: ['payment', 'auto'] },
  ['webhook.partner.com']
);
```

Contoh keluaran 1:
```javascript
{
  success: true,
  fullUrl: 'https://webhook.partner.com/api/v2/transactions?status=success&tags=payment&tags=auto',
  paramCount: 3
}
```

Contoh masukan 2 (Domain Ditolak):
```javascript
buildWebhookUrl(
  'https://webhook.attacker.com',
  'data',
  {},
  ['webhook.partner.com']
);
```

Contoh keluaran 2:
```javascript
{
  success: false,
  reason: 'Domain or protocol not allowed'
}
```

Contoh masukan 3 (Protokol Tidak Aman HTTP):
```javascript
buildWebhookUrl(
  'http://webhook.partner.com',
  'data',
  {},
  ['webhook.partner.com']
);
```

Contoh keluaran 3:
```javascript
{
  success: false,
  reason: 'Domain or protocol not allowed'
}
```

Batasan: Wajib menggunakan `new URL()` dan `URLSearchParams`. Dilarang menggunakan pustaka pembantu pihak ketiga.

---

## Navigasi

[Sebelumnya: Path](../05-path/README.md) | [Selanjutnya: File System](../07-file-system/README.md) | [Daftar Isi](../README.md)
