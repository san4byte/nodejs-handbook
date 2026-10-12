# Util

> Ringkasan
> - Fungsi: Menyediakan koleksi utilitas pembantu internal untuk pemformatan string, inspeksi objek mendalam, konversi fungsi asinkron, dan pengecekan tipe data tingkat rendah.
> - Digunakan saat: Memodernisasi fungsi callback warisan ke Promise, mencetak struktur objek yang memiliki referensi melingkar tanpa memicu crash, serta memvalidasi kesetaraan objek kompleks.
> - Aturan praktis: Selalu gunakan `util.promisify` saat mengintegrasikan pustaka berbasis callback `(err, value)` ke dalam basis kode modern berbasis `async/await`.

---

## Tujuan Belajar

- Memformat teks terstruktur menggunakan `util.format()` dengan berbagai penentu format (_specifier_).
- Menginspeksi objek bersarang dan referensi melingkar secara aman menggunakan `util.inspect()`.
- Mengonversi fungsi berbasis callback menjadi Promise menggunakan `util.promisify()` dan sebaliknya via `util.callbackify()`.
- Memeriksa tipe data internal V8 secara akurat memanfaatkan sub-modul `util.types`.
- Menguji kesetaraan mendalam dua struktur data menggunakan `util.isDeepStrictEqual()`.

---

## Konsep

> Modul `node:util` dianalogikan seperti pisau lipat serbaguna (_Swiss Army Knife_) milik seorang teknisi mekanik. Anda tidak menggunakan pisau lipat tersebut untuk membangun seluruh gedung pabrik dari awal. Namun, ketika Anda membutuhkan kaca pembesar untuk membaca nomor seri mikro pada komponen yang rumit (_`util.inspect`_), obeng adaptor untuk menyambungkan sekrup standar lama ke perkakas listrik modern (_`util.promisify`_), atau stempel penanda aus pada suku cadang usang (_`util.deprecate`_), perkakas ini menyediakan solusi bawaan yang siap pakai tanpa harus membeli alat baru dari toko luar.

```mermaid
flowchart TD
    UTIL["Modul node:util"] --> INSPECT["Inspeksi & Format (inspect, format, styleText)"]
    UTIL --> ASYNC_BRIDGE["Jembatan Asinkron (promisify, callbackify)"]
    UTIL --> TYPE_CHECK["Pemeriksaan Tipe & Nilai (types, isDeepStrictEqual)"]
    UTIL --> DIAGNOSTIC["Diagnostik & Siklus Hidup (deprecate, debuglog)"]
```

---

## Referensi

| Item | Fungsi | Catatan |
| :--- | :--- | :--- |
| **`format()`** | Memformat teks menggunakan penentu format placeholder gaya printf | Mendukung `%s` (string), `%d` (angka), `%j` (JSON), dan `%o` (objek) |
| **`inspect()`** | Mengembalikan representasi string terperinci dari objek JavaScript | Aman dari galat referensi melingkar (_circular reference_) dan mendukung opsi kedalaman |
| **`promisify()`** | Mengubah fungsi berbasis callback _error-first_ menjadi fungsi yang mengembalikan Promise | Mengasumsikan argumen terakhir fungsi adalah callback `(err, result)` |
| **`callbackify()`** | Mengubah fungsi berbasis Promise atau `async` menjadi fungsi berbasis callback | Berguna untuk menjaga kompatibilitas ke belakang dengan sistem warisan |
| **`deprecate()`** | Membungkus fungsi dengan peringatan resmi bahwa fungsi telah usang | Menampilkan peringatan ke `process.stderr` hanya saat fungsi pertama kali dipanggil |
| **`types`** | Kumpulan validator tipe internal V8 yang lebih presisi dibanding `typeof` | Mendukung pengujian `isDate`, `isPromise`, `isMap`, `isNativeError`, dan lainnya |
| **`isDeepStrictEqual()`** | Menguji apakah dua nilai atau struktur objek identik secara mendalam | Membandingkan prototipe, enumerable properties, dan nilai primitif |
| **`debuglog()`** | Membuat fungsi logging kondisional berbasis variabel lingkungan `NODE_DEBUG` | Tidak menghasilkan beban I/O saat flag debug terkait tidak diaktifkan |
| **`styleText()`** | Memberikan format warna dan gaya visual ANSI pada teks terminal | Fitur native modern Node.js untuk dekorasi CLI tanpa dependensi eksternal |

### `format()`

Fungsi `format()` menyusun string dengan menggantikan placeholder penentu format (_specifier_) menggunakan nilai argumen yang diberikan. Fungsi ini menjadi fondasi pemformatan pesan pada `console.log`.

```javascript
import util from 'node:util';

const message = util.format('User %s (ID: %d) has balance: $%d', 'Santoso', 102, 500);

console.log(message);
// Output: User Santoso (ID: 102) has balance: $500
```

Kasus lain: Melewatkan placeholder `%j` untuk merender objek ke format JSON langsung di tengah string.

```javascript
import util from 'node:util';

const jsonText = util.format('Event status: %j', { active: true, code: 200 });

console.log(jsonText);
// Output: Event status: {"active":true,"code":200}
```

### `inspect()`

Fungsi `inspect()` menghasilkan string diagnostik dari suatu objek, membedah struktur internalnya hingga tingkat kedalaman tertentu. Fungsi ini kebal terhadap referensi melingkar yang biasanya menggagalkan `JSON.stringify`.

```javascript
import util from 'node:util';

const rootObject = { name: 'Root' };
rootObject.circularRef = rootObject;

const inspected = util.inspect(rootObject, { depth: 2 });
console.log(inspected.includes('[Circular'));
// Output: true
```

Kasus lain: Menggunakan opsi `depth: null` untuk membuka seluruh struktur hierarki objek bersarang tanpa batas pemotongan.

```javascript
import util from 'node:util';

const deeplyNested = { a: { b: { c: { d: 'target' } } } };
const result = util.inspect(deeplyNested, { depth: null });

console.log(result.includes('target'));
// Output: true
```

### `promisify()`

Fungsi `promisify()` mengambil fungsi yang mengikuti konvensi callback _error-first_ Node.js `(err, value)` dan mengembalikannya sebagai fungsi berbasis Promise yang dapat dipanggil dengan `await`.

```javascript
import util from 'node:util';

function fetchUserProfile(id, callback) {
  if (id <= 0) {
    callback(new Error('Invalid user ID'));
    return;
  }
  callback(null, { id, name: 'John' });
}

const fetchUserProfileAsync = util.promisify(fetchUserProfile);
const profile = await fetchUserProfileAsync(10);

console.log(profile.name);
// Output: John
```

Kasus lain: Menangkap penolakan Promise ketika fungsi callback mengembalikan parameter error.

```javascript
import util from 'node:util';

function failOperation(callback) {
  callback(new Error('Connection failed'));
}

const failOperationAsync = util.promisify(failOperation);

try {
  await failOperationAsync();
} catch (error) {
  console.log(error.message);
  // Output: Connection failed
}
```

### `callbackify()`

Fungsi `callbackify()` adalah kebalikan dari `promisify`. Fungsi ini membungkus fungsi `async` atau fungsi pengembali Promise agar dapat menerima argumen callback `(err, result)` sebagai parameter penutup.

```javascript
import util from 'node:util';

async function calculateDiscountAsync(price) {
  return price * 0.9;
}

const calculateDiscountCallback = util.callbackify(calculateDiscountAsync);

calculateDiscountCallback(100000, (err, result) => {
  console.log(result);
  // Output: 90000
});
```

Kasus lain: Meneruskan galat yang dilempar dari fungsi async ke parameter pertama fungsi callback.

```javascript
import util from 'node:util';

async function throwAsyncError() {
  throw new Error('Computation failure');
}

const callbackFn = util.callbackify(throwAsyncError);

callbackFn((err, _result) => {
  console.log(err.message);
  // Output: Computation failure
});
```

### `deprecate()`

Fungsi `deprecate()` membungkus fungsi yang sudah tidak direkomendasikan dan mencetak peringatan _deprecation warning_ ke stream `process.stderr` saat pertama kali fungsi tersebut dipanggil oleh runtime.

```javascript
import util from 'node:util';

const legacyAdd = util.deprecate(
  (a, b) => a + b,
  'legacyAdd() is deprecated. Use modern calculator.',
  'DEP_ADD_001'
);

const sum = legacyAdd(5, 10);
console.log(sum);
// Output: 15
```

Kasus lain: Pemanggilan kedua dan seterusnya tidak akan mencetak peringatan berulang ke konsol guna mencegah polusi log.

```javascript
import util from 'node:util';

const legacyProcess = util.deprecate((x) => x * 2, 'legacyProcess is deprecated');
console.log(legacyProcess(4));
// Output: 8
console.log(legacyProcess(5));
// Output: 10
```

### `types`

Sub-objek `util.types` menyediakan serangkaian fungsi predikat untuk mengidentifikasi tipe data internal V8 secara akurat, mengatasi keterbatasan operator bawaan `typeof` yang sering kali ambigu.

```javascript
import util from 'node:util';

console.log(util.types.isDate(new Date()));
// Output: true
console.log(util.types.isPromise(Promise.resolve()));
// Output: true
console.log(util.types.isMap(new Map()));
// Output: true
```

Kasus lain: Membedakan objek galat native dari objek literal biasa.

```javascript
import util from 'node:util';

console.log(util.types.isNativeError(new TypeError('Invalid type')));
// Output: true
console.log(util.types.isNativeError({ message: 'Not a native error' }));
// Output: false
```

### `isDeepStrictEqual()`

Fungsi `isDeepStrictEqual()` membandingkan dua nilai secara mendalam dan ketat. Fungsi ini memverifikasi kesetaraan struktur objek, elemen array, kesamaan tipe primitif, dan prototipe.

```javascript
import util from 'node:util';

const objA = { tags: ['nodejs', 'backend'], config: { active: true } };
const objB = { tags: ['nodejs', 'backend'], config: { active: true } };

console.log(util.isDeepStrictEqual(objA, objB));
// Output: true
```

Kasus lain: Mendeteksi ketidaksamaan jika urutan elemen dalam array berbeda atau ada perbedaan tipe data primitif.

```javascript
import util from 'node:util';

const arrayA = [1, 2, '3'];
const arrayB = [1, 2, 3];

console.log(util.isDeepStrictEqual(arrayA, arrayB));
// Output: false
```

### `debuglog()`

Fungsi `debuglog()` menghasilkan fungsi logging yang hanya akan mencetak pesan ke terminal jika variabel lingkungan `NODE_DEBUG` memuat nama bagian (_section_) yang ditentukan.

```javascript
import util from 'node:util';

const debugServer = util.debuglog('http-server');

console.log(typeof debugServer);
// Output: function
```

Kasus lain: Memeriksa properti `enabled` pada fungsi debuglog untuk mengecek apakah logging bagian tersebut sedang aktif.

```javascript
import util from 'node:util';

const debugDb = util.debuglog('database');
console.log(typeof debugDb.enabled);
// Output: boolean
```

### `styleText()`

Fungsi `styleText()` menerapkan format warna, garis bawah, atau ketebalan font teks terminal menggunakan kode escape ANSI standar tanpa membutuhkan dependensi pustaka pihak ketiga.

```javascript
import util from 'node:util';

const boldText = util.styleText('bold', 'System Notification');

console.log(typeof boldText);
// Output: string
console.log(boldText.includes('System Notification'));
// Output: true
```

Kasus lain: Menerapkan beberapa gaya visual sekaligus menggunakan format array.

```javascript
import util from 'node:util';

const styledText = util.styleText(['red', 'underline'], 'Fatal Error');
console.log(typeof styledText);
// Output: string
```

### Perbandingan: `promisify()` vs `callbackify()`

| Karakteristik | `promisify()` | `callbackify()` |
| :--- | :--- | :--- |
| **Masukan Fungsi** | Fungsi berbasis callback konvensional `(..., cb)` | Fungsi berbasis Promise atau `async function` |
| **Keluaran Fungsi** | Mengembalikan Promise (`awaitable`) | Menerima fungsi callback sebagai parameter terakhir |
| **Penanganan Galat** | Melempar eksepsi via penolakan Promise (`reject`) | Meneruskan galat ke argumen pertama callback (`err`) |
| **Skenario Penggunaan** | Memodernisasi pustaka warisan untuk digunakan di ESM | Mempertahankan kompatibilitas pustaka baru bagi konsumen lama |

---

## Kesalahan Umum

### Memakai `promisify` pada Fungsi yang Tidak Mengikuti Standar Callback

Fungsi `util.promisify` mengasumsikan callback selalu berada di parameter terakhir dan menerima argumen `(err, result)`. Jika fungsi legacy tidak mengikuti pola ini (misalnya `(result, err)` atau tidak menerima err), `promisify` akan salah memetakan nilai hasil dan galat.

```javascript
// Salah
function legacyOperation(callback, value) {
  callback(value); // Parameter callback tidak di akhir dan tanpa error-first
}
const badPromisify = util.promisify(legacyOperation);
```

```javascript
// Benar
function standardOperation(value, callback) {
  callback(null, value); // Mengikuti konvensi (err, result) di parameter akhir
}
const correctPromisify = util.promisify(standardOperation);
```

### Menggunakan `JSON.stringify` untuk Inspeksi Objek Circular

Mencoba mencetak objek yang mereferensikan dirinya sendiri atau hubungan induk-anak yang melingkar menggunakan `JSON.stringify` akan memicu kegagalan fatal `TypeError: Converting circular structure to JSON`.

```javascript
// Salah
const parent = { name: 'Parent' };
parent.self = parent;
console.log(JSON.stringify(parent)); // Melempar TypeError fatal!
```

```javascript
// Benar
import util from 'node:util';

const parent = { name: 'Parent' };
parent.self = parent;
console.log(util.inspect(parent, { depth: 2 }));
```

### Menggunakan Operator `typeof` untuk Validasi Objek Kompleks

Operator `typeof` mengembalikan string `'object'` untuk tipe Date, RegExp, Map, dan Promise, sehingga rentan menimbulkan kesalahan logika validasi.

```javascript
// Salah
function validateDate(input) {
  return typeof input === 'object'; // Masih meloloskan objek biasa {}, [], atau null
}
```

```javascript
// Benar
import util from 'node:util';

function validateDate(input) {
  return util.types.isDate(input); // Akurat memvalidasi instance Date V8 native
}
```

---

## Studi Kasus

Skenario: Membangun modul adaptor klien basis data warisan (_legacy database client adapter_) yang memodernisasi fungsi-fungsi berbasis callback kuno menjadi antarmuka modern berbasis `async/await`, memvalidasi tipe data masukan secara presisi menggunakan `util.types`, serta menyediakan representasi log inspeksi yang aman terhadap referensi melingkar.

```javascript
import util from 'node:util';

class LegacyDatabaseClient {
  query(sql, callback) {
    if (!sql || typeof sql !== 'string') {
      callback(new TypeError('SQL query must be a valid string'));
      return;
    }
    // Simulasi respons basis data yang memiliki referensi relasional melingkar
    const row = { id: 1, query: sql };
    const transaction = { transactionId: 'TRX-99', entry: row };
    row.transaction = transaction; // Hubungan melingkar

    callback(null, [row]);
  }
}

class ModernDatabaseAdapter {
  #legacyClient;
  #queryAsync;

  constructor(legacyClient) {
    this.#legacyClient = legacyClient;
    // Konversi metode callback ke Promise dengan binding konteks instance
    this.#queryAsync = util.promisify(this.#legacyClient.query.bind(this.#legacyClient));
  }

  async executeQuery(sql) {
    const result = await this.#queryAsync(sql);
    return result;
  }

  formatAuditResult(result) {
    // Inspeksi aman tanpa risiko crash akibat circular structure
    return util.inspect(result, { depth: 3, compact: true });
  }
}

const adapter = new ModernDatabaseAdapter(new LegacyDatabaseClient());
const data = await adapter.executeQuery('SELECT * FROM users');

console.log(Array.isArray(data));
// Output: true
console.log(data[0].id);
// Output: 1

const auditLog = adapter.formatAuditResult(data);
console.log(auditLog.includes('[Circular'));
// Output: true
```

Desain ini dipilih karena memadukan `util.promisify` untuk menjembatani integrasi basis kode modern, sekaligus mengamankan pencatatan log audit dari ancaman galat circular reference menggunakan `util.inspect`.

---

## Latihan Mandiri

### Soal 1 (Dasar)

Buat fungsi `formatAuditMessage(moduleCode, actionName, payload)` yang menggunakan `util.format` untuk merangkai string log terstruktur dengan format `"[MODULE:%s] Action '%s' executed with payload: %j"`.

Contoh masukan:
```javascript
formatAuditMessage('AUTH', 'LOGIN_FAILURE', { ip: '127.0.0.1', attempts: 3 });
```

Contoh keluaran yang diharapkan:
```javascript
"[MODULE:AUTH] Action 'LOGIN_FAILURE' executed with payload: {\"ip\":\"127.0.0.1\",\"attempts\":3}"
```

Batasan: Gunakan modul bawaan `node:util` tanpa penggabungan string manual.

### Soal 2 (Menengah)

Buat fungsi `modernizeClient(callbackClient)` yang menerima objek dengan metode callback legacy `fetchData(key, callback)` dan `saveData(key, value, callback)`. Fungsi harus mengembalikan objek baru yang memiliki metode modern `fetchDataAsync(key)` dan `saveDataAsync(key, value)` berbasis Promise menggunakan `util.promisify`. Selain itu, tambahkan peringatan usang via `util.deprecate` jika pemanggil masih mengakses metode callback aslinya.

Contoh masukan:
```javascript
const legacyClient = {
  fetchData(key, cb) { cb(null, 'value-' + key); },
  saveData(key, val, cb) { cb(null, true); }
};

const modernClient = modernizeClient(legacyClient);
await modernClient.fetchDataAsync('settings');
```

Contoh keluaran yang diharapkan:
```javascript
'value-settings'
```

Batasan: Gunakan `util.promisify` dan `util.deprecate` dari `node:util`.

### Soal 3 (Menantang)

Buat fungsi penganalisis integritas status aplikasi (_state change auditor_) bernama `auditStateChange(oldState, newState)`.

Ketentuan pemrosesan:
- Gunakan `util.isDeepStrictEqual` untuk memeriksa apakah kedua status benar-benar identik. Jika ya, kembalikan objek `{ hasChanged: false, summary: 'States are identical' }`.
- Jika mengalami perubahan, periksa kunci-kunci pada level pertama:
  - Bandingkan kesamaan nilai pada masing-masing kunci menggunakan `util.isDeepStrictEqual`.
  - Jika nilainya berupa objek khusus V8 (seperti `Date`, `Map`, atau `Promise`), gunakan `util.types` untuk mencatat tipe spesifiknya ke dalam metadata laporan.
  - Jika objek memuat referensi melingkar (_circular reference_), gunakan `util.inspect` dengan batasan kedalaman `depth: 2` untuk menghasilkan representasi string ringkas tanpa melempar galat runtime.
- Kembalikan objek `{ hasChanged: true, changedKeys: [...], inspectedSummary: '<string>' }`.

Contoh masukan 1:
```javascript
const s1 = { date: new Date('2026-01-01'), counter: 5 };
const s2 = { date: new Date('2026-01-01'), counter: 5 };
auditStateChange(s1, s2);
```

Contoh keluaran 1:
```javascript
{
  hasChanged: false,
  summary: 'States are identical'
}
```

Contoh masukan 2:
```javascript
const objA = { role: 'guest' };
const objB = { role: 'admin', timestamp: new Date('2026-10-12') };
objB.self = objB;
auditStateChange(objA, objB);
```

Contoh keluaran 2:
```javascript
{
  hasChanged: true,
  changedKeys: [ 'role', 'timestamp', 'self' ],
  inspectedSummary: "<ref *1> { role: 'admin', timestamp: 2026-10-12T00:00:00.000Z, self: [Circular *1] }"
}
```

Batasan: Wajib menggunakan `util.isDeepStrictEqual`, `util.types`, dan `util.inspect`. Dilarang menggunakan dependensi eksternal dari NPM.

---

## Navigasi

[Sebelumnya: Report](../19-report/README.md) | [Selanjutnya: Debugger](../21-debugger/README.md) | [Daftar Isi](../README.md)
