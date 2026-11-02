# Validation

> Membangun engine validasi skema data dan sanitasi payload berbasis fungsi murni dan class tanpa dependensi pihak ketiga.

## Core Concepts

- Validasi data di level service/controller mencegah data kotor atau berbahaya masuk ke database.
- *Method Chaining* memungkinkan deklarasi skema yang deklaratif dan mudah dibaca: `schema.string().required().min(3)`.
- Mengumpulkan seluruh error dalam satu eksekusi (*collected errors*) memberikan pengalaman UX yang jauh lebih baik daripada berhenti pada error pertama (*fail-fast*).
- Pemisahan aturan (rules), tipe data (types), dan pesan error (errors) menghasilkan arsitektur validasi modular yang mudah diperluas.

## Referensi

Daftar API dan method builder skema validasi:

| API / Fitur | Fungsi |
|---|---|
| `schema.string()` | Membuat skema aturan string dengan dukungan method chainable |
| `schema.number()` | Membuat skema aturan angka dengan batasan minimum dan maksimum |
| `schema.object(shape)` | Membuat skema aturan untuk struktur objek bersarang (*nested object*) |
| `schema.validate(data, schemaInstance)` | Mengeksekusi validasi payload terhadap instance skema |

### `schema.string()`

Metode ini menginisialisasi builder aturan skema untuk data bertipe teks string.

- Tidak menerima argumen inisialisasi.
- **Returns:** `StringSchema`, instance builder dengan rantai method validasi:
  - `.required(customMsg?)`: Memvalidasi bahwa teks tidak kosong atau bernilai null/undefined.
  - `.min(length, customMsg?)`: Memvalidasi panjang karakter minimum.
  - `.max(length, customMsg?)`: Memvalidasi batas panjang karakter maksimum.
  - `.email(customMsg?)`: Memvalidasi format pola email yang valid.
  - `.enum(values, customMsg?)`: Memvalidasi bahwa teks termasuk dalam daftar opsi yang diizinkan.

```js
import { schema } from './src/schema.mjs';

const usernameSchema = schema.string()
  .required('Username is required')
  .min(3, 'Username must be at least 3 characters')
  .enum(['admin', 'editor'], 'Invalid role');

console.log(typeof usernameSchema._validate === 'function');
// Output: true
```

### `schema.number()`

Metode ini menginisialisasi builder aturan skema untuk data bertipe numerik.

- Tidak menerima argumen inisialisasi.
- **Returns:** `NumberSchema`, instance builder dengan rantai method validasi:
  - `.required(customMsg?)`: Memvalidasi bahwa nilai berupa angka valid dan bukan NaN.
  - `.min(limit, customMsg?)`: Memvalidasi nilai minimum angka.
  - `.max(limit, customMsg?)`: Memvalidasi batas maksimum angka.

```js
import { schema } from './src/schema.mjs';

const ageSchema = schema.number().required('Age is required').min(18, 'Must be an adult');
console.log(typeof ageSchema._validate === 'function');
// Output: true
```

### `schema.object(shape)`

Metode ini menyusun skema struktural untuk memvalidasi objek dan properti bersarang.

- `shape` (Record<string, any>, required): Objek pemetaan properti kunci beserta instance skema aturannya masing-masing.
- **Returns:** `ObjectSchema`, instance builder penampung skema hierarkis.

```js
import { schema } from './src/schema.mjs';

const userSchema = schema.object({
  name: schema.string().required(),
  age: schema.number().min(0),
});
```

### `schema.validate(data, schemaInstance)`

Fungsi utama yang mengeksekusi pemeriksaan payload input terhadap skema aturan yang diberikan.

- `data` (any, required): Data payload mentah yang akan diperiksa.
- `schemaInstance` (any, required): Instance skema definisi aturan yang menjadi acuan validasi.
- **Returns:** any, mengembalikan objek `data` asli jika valid, atau melempar `ValidationError` berisi daftar error jika gagal.

```js
import { schema } from './src/schema.mjs';

const profileSchema = schema.object({
  name: schema.string().required().min(3),
  age: schema.number().required().min(18),
});

const result = schema.validate({ name: 'Ada Lovelace', age: 25 }, profileSchema);
console.log(result.name, result.age);
// Output: Ada Lovelace 25
```

## Examples

### 1. Validasi Payload User

```js title="example.mjs"
import { schema } from './src/schema.mjs';

const registerSchema = schema.object({
  username: schema.string().required().min(3),
  email: schema.string().required().email(),
});

try {
  const result = schema.validate({ username: 'joko', email: 'joko@test.com' }, registerSchema);
  console.log('Valid user:', result.username);
  // Output: Valid user: joko
} catch (err) {
  console.error('Validation errors:', err.errors);
}
```

## Real-World Use Case

**Backend**

**Masalah:** endpoint HTTP menerima payload data yang tidak lengkap atau tidak valid dari client, yang menyebabkan query database gagal dan mencemari integritas penyimpanan.
**Solusi:** validasi payload request HTTP di lapisan controller sebelum data diproses oleh service.

```js title="validate-controller.mjs"
import { schema } from './src/schema.mjs';

const payloadSchema = schema.object({
  title: schema.string().required().min(5),
});

function handleCreateTodo(body) {
  try {
    schema.validate(body, payloadSchema);
    return { status: 200, message: 'Saved' };
  } catch (err) {
    return { status: 400, errors: err.errors };
  }
}

console.log('Valid status:', handleCreateTodo({ title: 'Learn Node.js' }).status);
console.log('Invalid status:', handleCreateTodo({ title: 'Hi' }).status);
// Output: Valid status: 200
// Output: Invalid status: 400
```

## Pitfalls

- Menghentikan validasi pada kegagalan pertama (*fail-fast*). Hal ini merugikan pengalaman pengguna formulir web; selalu kumpulkan seluruh error sekaligus.
  ```js
  // ❌ Incorrect: fail-fast returns only the first broken field
  // if (!body.name) throw new Error('Name required');
  // if (!body.email) throw new Error('Email required');

  // ✅ Correct: schema validator collects all errors in a single run
  try {
    schema.validate({ name: '' }, registerSchema);
  } catch (err) {
    console.log('Errors collected:', Array.isArray(err.errors));
  }
  // Output: Errors collected: true
  ```

## References

- [JavaScript Reference: Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

---

Sebelumnya: [02 - Package Management](../02-package-management/README.md) | Berikutnya: [04 - Testing](../04-testing/README.md)
