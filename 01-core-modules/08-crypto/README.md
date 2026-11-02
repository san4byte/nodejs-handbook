# Crypto (Kriptografi & Keamanan)

> Modul `node:crypto` menyediakan fungsionalitas kriptografi komprehensif, mencakup pembentukan hash satu arah, HMAC, derivasi kunci aman untuk password (`scrypt`), dan enkripsi terotentikasi (AES-GCM).

## Core Concepts

- Gunakan `crypto.randomUUID()` untuk menghasilkan UUID v4 yang aman secara kriptografis tanpa dependensi paket luar.
- Jangan gunakan SHA-256 biasa untuk password karena rentan brute-force; gunakan algoritma lambat yang tahan komputasi GPU seperti `scrypt`.
- Untuk mencegah serangan *timing attack*, gunakan `crypto.timingSafeEqual()` saat membandingkan token atau hash rahasia.
- Gunakan mode enkripsi terotentikasi seperti `aes-256-gcm` yang menjamin integritas data dengan auth tag.

## Referensi

Daftar API modul `node:crypto` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `crypto.createHash(algorithm, options?)` | Membuat instance Hash satu arah (contoh: `'sha256'`, `'sha512'`) |
| `crypto.createHmac(algorithm, key, options?)` | Membuat instance HMAC menggunakan secret key bersama |
| `crypto.randomBytes(size)` | Menghasilkan buffer acak berderajat kriptografi (*CSPRNG*) |
| `crypto.timingSafeEqual(a, b)` | Membandingkan dua buffer dengan durasi waktu konstan |
| `crypto.scrypt(password, salt, keylen, options?, callback?)` | Fungsi derivasi kunci lambat untuk hashing password aman |

### `crypto.createHash(algorithm, options?)`

Fungsi ini membuat objek stream kalkulasi hash satu arah untuk data biner atau teks.

- `algorithm` (string, required): Nama cipher hash seperti `'sha256'` atau `'sha512'`.
- `options` (object, optional): Konfigurasi stream bawaan seperti `outputLength` untuk cipher XOF.
- **Returns:** `Hash`, instance kalkulasi hash satu arah.

```js
import crypto from 'node:crypto';

const hash = crypto.createHash('sha256').update('password123').digest('hex');
console.log('SHA-256 length:', hash.length);
// Output: SHA-256 length: 64
```

### `crypto.createHmac(algorithm, key, options?)`

Fungsi ini menghasilkan Hash-based Message Authentication Code untuk memverifikasi keaslian dan integritas payload.

- `algorithm` (string, required): Algoritma hash kriptografi (misalnya `'sha256'`).
- `key` (string | Buffer, required): Kunci rahasia bersama (*shared secret*).
- `options` (object, optional): Konfigurasi stream HMAC.
- **Returns:** `Hmac`, objek stream pembentuk tanda tangan otentikasi.

```js
import crypto from 'node:crypto';

const secretKey = 'my-shared-secret';
const signature = crypto.createHmac('sha256', secretKey).update('payload').digest('hex');
console.log('Signature length:', signature.length);
// Output: Signature length: 64
```

### `crypto.randomBytes(size)`

Fungsi ini menghasilkan urutan byte acak berderajat kriptografi aman (*CSPRNG*).

- `size` (number, required): Jumlah byte acak yang diminta.
- **Returns:** `Buffer`, blok memori biner berisi nilai acak.

```js
import crypto from 'node:crypto';

const salt = crypto.randomBytes(16);
console.log('Salt bytes:', salt.length);
// Output: Salt bytes: 16
```

### `crypto.timingSafeEqual(a, b)`

Fungsi ini membandingkan isi byte dua Buffer secara konstan waktu guna mencegah kebocoran informasi melalui durasi pemrosesan (*timing attack*).

- `a` (Buffer | TypedArray | DataView, required): Buffer pertama yang dibandingkan.
- `b` (Buffer | TypedArray | DataView, required): Buffer kedua (panjang byte harus persis sama dengan `a`).
- **Returns:** boolean, bernilai `true` jika kedua buffer identik, atau `false` jika berbeda.

```js
import crypto from 'node:crypto';

const bufA = Buffer.from('secret-token');
const bufB = Buffer.from('secret-token');
console.log(crypto.timingSafeEqual(bufA, bufB));
// Output: true
```

### `crypto.scrypt(password, salt, keylen, options?, callback?)`

Fungsi derivasi kunci lambat (KDF) yang dirancang untuk mencegah serangan brute-force berbasis akselerasi GPU.

- `password` (string | Buffer, required): Kata sandi masukan pengguna.
- `salt` (string | Buffer, required): Garam acak unik untuk mencegah *rainbow table attack*.
- `keylen` (number, required): Panjang byte kunci turunan yang dihasilkan.
- `options` (object, optional): Konfigurasi beban memori dan komputasi seperti `{ N, r, p }`.
- `callback` ((err: Error | null, derivedKey: Buffer) => void, optional): Callback penampung hasil komputasi kunci.
- **Returns:** void (atau Promise<Buffer> jika dipromisify via `node:util`).

```js
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);
const derived = await scryptAsync('user-pass', 'random-salt', 32, { N: 16384 });
console.log('Derived key length:', derived.length);
// Output: Derived key length: 32
```

## Examples

### 1. Hash dan UUID Kriptografis

```js title="src/hash.mjs"
// run: node src/hash.mjs
import crypto from 'node:crypto';

const text = 'secret message';
const hash = crypto.createHash('sha256').update(text).digest('hex');
console.log('SHA-256 Hash length:', hash.length);
// Output: SHA-256 Hash length: 64
console.log('SHA-256 Hash sample:', hash.slice(0, 16));
// Output: SHA-256 Hash sample: bb0b57005f01018b

const id = crypto.randomUUID();
console.log('Valid UUID v4:', typeof id === 'string');
// Output: Valid UUID v4: true
```

## Real-World Use Case

**Backend**

**Masalah:** menyimpan password user dalam format plain text atau hash MD5/SHA-256 biasa sangat membahayakan data pengguna jika basis data bocor.
**Solusi:** hash password menggunakan `crypto.scrypt` dengan salt acak 16 byte, dan verifikasi kecocokannya dengan `crypto.timingSafeEqual`.

```js title="auth-crypto.mjs"
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const keyBuf = Buffer.from(key, 'hex');
  const derived = await scrypt(password, salt, 64);
  return crypto.timingSafeEqual(keyBuf, derived);
}

const hash = await hashPassword('mySecretPass');
console.log('Verified:', await verifyPassword('mySecretPass', hash));
// Output: Verified: true
console.log('Wrong pass:', await verifyPassword('wrong', hash));
// Output: Wrong pass: false
```

## Pitfalls

- Membandingkan token rahasia menggunakan operator kesetaraan biasa (`===`) yang rentan terhadap *timing attack*.
  ```js
  // ❌ Incorrect: early-exit leaks byte comparison duration
  // if (userInputToken === secretToken) { ... }

  // ✅ Correct: constant-time comparison prevents timing analysis
  const bufA = Buffer.from('token-secret');
  const bufB = Buffer.from('token-secret');
  const isValid = crypto.timingSafeEqual(bufA, bufB);
  console.log('Valid:', isValid);
  // Output: Valid: true
  ```
- Menghasilkan token acak atau session ID menggunakan `Math.random()`.
  ```js
  // ❌ Incorrect: predictable pseudorandom generator
  // const token = Math.random().toString(36).substring(2);

  // ✅ Correct: cryptographically secure random values
  const token = crypto.randomBytes(32).toString('hex');
  console.log('Secure token length:', token.length);
  // Output: Secure token length: 64
  ```

## References

- [Node.js Docs: Crypto](https://nodejs.org/api/crypto.html)

---

Sebelumnya: [07 - HTTP](../07-http/README.md) | Berikutnya: [09 - Zlib](../09-zlib/README.md)
