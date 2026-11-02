# Testing

> Memahami arsitektur internal framework pengujian seperti Jest atau Vitest dengan membangun runner, assertions (`expect`), lifecycle hooks, dan mock dari nol.

## Core Concepts

- Test suite mengorganisir pengujian secara hierarkis menggunakan blok `describe()` dan kasus uji individual `it()`.
- Assertion (`expect`) memvalidasi ekspektasi logika; jika gagal, assertion melempar error yang ditangkap oleh runner.
- Lifecycle hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`) mengisolasi state agar pengujian tidak saling mempengaruhi (*side-effects*).
- Runner mengatur kode keluar (`process.exitCode = 1`) jika ada pengujian yang gagal agar dikenali oleh pipeline CI/CD.

## Referensi

Daftar fungsi framework pengujian mandiri:

| API / Fitur | Fungsi |
|---|---|
| `describe(name, fn)` | Mengelompokkan serangkaian pengujian dalam satu suite logis |
| `it(name, fn)` | Mendefinisikan satu kasus pengujian individual (sinkron atau async) |
| `expect(actual)` | Membungkus nilai yang diuji dengan method assertion matcher |
| `fn(implementation?)` | Membuat fungsi tiruan (*mock*) dengan implementasi kustom |
| `spyOn(object, methodName)` | Memasang mata-mata pada method objek tanpa merusak fungsinya |

### `describe(name, fn)`

Fungsi ini membuat grup hierarki penampung kasus-kasus pengujian yang berelasi.

- `name` (string, required): Judul atau nama deskriptif dari test suite.
- `fn` (() => void, required): Fungsi penampung registrasi kasus uji di dalam blok.
- **Returns:** void.

```js
import { describe, it } from './src/describe-it.mjs';

describe('Calculator', () => {
  it('adds two numbers', () => {
    // test body
  });
});
```

### `it(name, fn)`

Fungsi ini mendaftarkan satu unit kasus pengujian spesifik ke dalam antrean eksekusi suite aktif.

- `name` (string, required): Deskripsi perilaku yang sedang diuji.
- `fn` (() => void | Promise<void>, required): Callback pengujian yang dapat berjalan sinkron maupun asinkron.
- **Returns:** void.

```js
import { it } from './src/describe-it.mjs';

it('fetches remote configuration', async () => {
  const data = await Promise.resolve({ ok: true });
  console.log('Async test ready:', data.ok);
});
// Output: Async test ready: true
```

### `expect(actual)`

Fungsi ini membungkus nilai nyata yang dihasilkan oleh kode aplikasi dengan kumpulan matcher pengujian.

- `actual` (any, required): Nilai hasil eksekusi yang akan dibandingkan dengan ekspektasi.
- **Returns:** MatcherObject, instance objek berisi metode pembanding:
  - `.toBe(expected)`: Membandingkan kesamaan nilai primitif menggunakan aturan `Object.is`.
  - `.toEqual(expected)`: Membandingkan kesetaraan struktur objek dan array secara rekursif (*deep equality*).
  - `.toThrow(expectedMessage?)`: Memvalidasi bahwa pemanggilan fungsi melempar exception sesuai pesan yang diharapkan.

```js
import { expect } from './src/expect.mjs';

expect(2 + 2).toBe(4);
expect({ active: true }).toEqual({ active: true });
expect(() => {
  throw new Error('Access denied');
}).toThrow('Access denied');
```

### `fn(implementation?)`

Fungsi ini membuat fungsi tiruan (*mock*) untuk mengisolasi ketergantungan logika luar dan melacak frekuensi serta argumen pemanggilannya.

- `implementation` ((...args: any[]) => any, optional): Implementasi tiruan kustom yang dijalankan saat mock dipanggil.
- **Returns:** `MockFunction`, fungsi mata-mata yang menyimpan riwayat panggilan pada array `.calls` dan nilai kembalian pada array `.results`.

```js
import { fn } from './src/mock.mjs';

const mockCallback = fn((x) => x * 2);
mockCallback(5);
console.log('Calls length:', mockCallback.calls.length);
console.log('First call arg:', mockCallback.calls[0][0]);
// Output: Calls length: 1
// Output: First call arg: 5
```

### `spyOn(object, methodName)`

Fungsi ini menggantikan method pada objek yang sudah ada dengan fungsi pelacak tanpa menghilangkan implementasi aslinya.

- `object` (Record<string, any>, required): Objek sumber yang memiliki method target.
- `methodName` (string, required): Nama method yang ingin dipasangi mata-mata.
- **Returns:** `MockFunction`, instance spy yang dilengkapi fungsi `.mockRestore()` untuk mengembalikan method asli.

```js
import { spyOn } from './src/mock.mjs';

const service = { ping: () => 'pong' };
const spy = spyOn(service, 'ping');
service.ping();
console.log('Spy called:', spy.calls.length);
// Output: Spy called: 1
```

## Examples

### 1. Menjalankan Kasus Pengujian

```js title="sample-test.mjs"
// run: node 04-testing/tests/sample.test.mjs
import { describe, it } from './src/describe-it.mjs';
import { expect } from './src/expect.mjs';
import { runTests } from './src/runner.mjs';

describe('Math operations', () => {
  it('adds two numbers correctly', () => {
    expect(10 + 20).toBe(30);
  });
});

await runTests();
// Output: Suite: Math operations
// Output:   ✔ adds two numbers correctly
// Output: --- Test Summary ---
// Output: Total: 2 | Passed: 2 | Failed: 0
```

## Real-World Use Case

**Tooling**

**Masalah:** memverifikasi bahwa service pengirim email benar-benar dipanggil dengan alamat email dan token yang tepat tanpa mengirim email sungguhan ke jaringan internet.
**Solusi:** gunakan mock function (`fn`) untuk mengisolasi dan mengaudit pemanggilan fungsi pihak ketiga.

```js title="mock-test.mjs"
import { fn } from './src/mock.mjs';
import { expect } from './src/expect.mjs';

function sendWelcome(email, mailer) {
  mailer(email, 'Welcome to the platform!');
}

const mockMailer = fn();
sendWelcome('user@test.com', mockMailer);

expect(mockMailer.calls.length).toBe(1);
console.log('Target email:', mockMailer.calls[0][0]);
// Output: Target email: user@test.com
```

## Pitfalls

- Lupa menulis `await` pada assertion asynchronous di dalam `it()`, yang mengakibatkan runner menganggap tes selesai sukses sebelum error asinkron dilempar.
  ```js
  // ❌ Incorrect: promise executes unhandled after test finishes
  // it('fetches data', () => {
  //   fetchUser().then(u => expect(u).toBeDefined());
  // });

  // ✅ Correct: await async operations cleanly
  it('fetches data', async () => {
    const user = await Promise.resolve({ id: 1 });
    expect(user.id).toBe(1);
  });
  ```
- Mengubah variabel global di dalam satu test tanpa membersihkannya di `afterEach()`, yang menimbulkan *test pollution* pada pengujian berikutnya.

## References

- [Node.js Docs: Test Runner (node:test)](https://nodejs.org/api/test.html)

---

Sebelumnya: [03 - Validation](../03-validation/README.md) | Berikutnya: [05 - Logging](../05-logging/README.md)
