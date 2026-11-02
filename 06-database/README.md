# Database

> Memahami prinsip internal basis data (storage engine, transaksi atomik, penanganan *race condition*, dan Write-Ahead Log) dengan membangun engine database JSON murni tanpa dependensi eksternal.

## Core Concepts

- Basis data dokumen membutuhkan penyimpanan persisten yang tahan terhadap kegagalan mendadak (*crash resilience*).
- **Atomic Write:** mencegah data korup dengan menulis ke file `.tmp` lalu mengubah nama file secara atomik via `fs.rename()`.
- **Concurrency Lock:** antrean Promise sekuensial yang mencegah *race condition* saat beberapa request HTTP mencoba memodifikasi file secara bersamaan.
- **Write-Ahead Log (WAL):** mencatat setiap aksi (`INSERT`, `UPDATE`, `DELETE`) ke file log append-only sebelum data utama ditulis ke storage.

## Referensi

Daftar kelas dan metode engine basis data:

| API / Fitur | Fungsi |
|---|---|
| `new Collection(name, dataDir?)` | Membuat instance koleksi dokumen untuk tabel/entitas tertentu |
| `collection.insert(doc)` | Menyimpan dokumen baru dengan ID acak dan timestamp otomatis |
| `collection.find(predicate?)` | Mengambil dan memfilter daftar dokumen yang cocok |
| `collection.update(id, updates)` | Memperbarui isi dokumen berdasarkan ID secara atomik |
| `collection.delete(id)` | Menghapus dokumen berdasarkan ID dari storage |

### `new Collection(name, dataDir?)`

Konstruktor ini menginisialisasi penyimpanan koleksi dokumen entitas pada direktori target.

- `name` (string, required): Nama entitas koleksi atau tabel penyimpanan (misalnya `'todos'`, `'users'`).
- `dataDir` (string, optional, default `'./data'`): Direktori path penyimpanan berkas data JSON dan log WAL.
- **Returns:** `Collection`, instance engine koleksi dokumen berbasis JSON.

```js
import { Collection } from './src/collection.mjs';

const todos = new Collection('todos', './data/app');
```

### `collection.insert(doc)`

Metode ini mengunci antrean operasi, mencatat ke log WAL, lalu menulis data secara atomik ke disk.

- `doc` (Record<string, any>, required): Objek payload data dokumen baru yang akan disimpan.
- **Returns:** Promise<object>, dokumen tersimpan yang dilengkapi properti `id` unik dan `createdAt`.

```js
const item = await todos.insert({ title: 'Read handbook', done: false });
console.log('Inserted:', item.title);
// Output: Inserted: Read handbook
```

### `collection.find(predicate?)`

Metode ini membaca seluruh berkas dan menyaring dokumen berdasarkan kondisi yang diberikan.

- `predicate` ((doc: any) => boolean, optional, default `() => true`): Fungsi predikat untuk menyaring record yang cocok.
- **Returns:** Promise<Array<object>>, daftar dokumen yang lolos evaluasi predikat.

```js
const activeTodos = await todos.find((t) => t.done === false);
console.log('Active count:', activeTodos.length);
// Output: Active count: 1
```

### `collection.update(id, updates)`

Metode ini memodifikasi properti dokumen target secara atomik dan memperbarui timestamp.

- `id` (string, required): Identifier unik dokumen target.
- `updates` (Record<string, any>, required): Objek pembaruan nilai properti.
- **Returns:** Promise<object>, dokumen termutasi yang dilengkapi timestamp `updatedAt`.

```js
const updated = await todos.update(item.id, { done: true });
console.log('Done status:', updated.done);
// Output: Done status: true
```

### `collection.delete(id)`

Metode ini menghapus rekaman dokumen dari storage dan mencatat riwayat penghapusan ke WAL.

- `id` (string, required): Identifier unik dokumen yang akan dihapus.
- **Returns:** Promise<boolean>, bernilai `true` jika dokumen ditemukan dan dihapus, atau `false` jika tidak ditemukan.

```js
const isDeleted = await todos.delete(item.id);
console.log('Deleted:', isDeleted);
// Output: Deleted: true
```

## Examples

### 1. Operasi CRUD pada Koleksi

```js title="db-demo.mjs"
import { Collection } from './src/collection.mjs';
import fs from 'node:fs/promises';

const db = new Collection('notes', './data/demo');

const created = await db.insert({ text: 'Study Node.js' });
console.log('Inserted:', created.text);

const list = await db.find((n) => n.text.includes('Node.js'));
console.log('Found total:', list.length);
// Output: Inserted: Study Node.js
// Output: Found total: 1

await fs.rm('./data/demo', { recursive: true, force: true });
```

## Real-World Use Case

**Backend**

**Masalah:** dua request HTTP bersamaan mencoba memperbarui counter yang sama, menyebabkan kondisi *race condition* dan hilangnya salah satu data (*lost update*).
**Solusi:** kelola mutasi melalui `AsyncLock` di level Collection sehingga seluruh operasi baca-tulis disk dieksekusi secara berurutan (*serialized*).

```js title="safe-concurrency.mjs"
import { Collection } from './src/collection.mjs';
import fs from 'node:fs/promises';

const items = new Collection('counters', './data/conc');
const item = await items.insert({ count: 0 });

await Promise.all([
  items.update(item.id, { count: 1 }),
  items.update(item.id, { count: 2 }),
]);

const finalState = await items.find((i) => i.id === item.id);
console.log('Final count serialized:', finalState[0].count > 0);
// Output: Final count serialized: true

await fs.rm('./data/conc', { recursive: true, force: true });
```

## Pitfalls

- Menulis berkas JSON bersamaan secara langsung tanpa antrean serialisasi lock, yang menghasilkan sintaks JSON rusak saat request konkuren.
  ```js
  // ❌ Incorrect: concurrent file overwrites corrupt data
  // Promise.all([fs.writeFile('db.json', data1), fs.writeFile('db.json', data2)]);

  // ✅ Correct: serialize mutations sequentially via async locks
  await items.update(item.id, { count: 1 });
  ```
- Mengabaikan `node:sqlite` bawaan. Di Node.js versi 22.5+, runtime menyediakan engine SQLite native untuk kebutuhan basis data relasional tanpa perlu library eksternal.
  ```js
  // ✅ Recommended for relational data in Node.js 22.5+
  import { DatabaseSync } from 'node:sqlite';
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
  ```

## References

- [Node.js Docs: SQLite (node:sqlite)](https://nodejs.org/api/sqlite.html)

---

Sebelumnya: [05 - Logging](../05-logging/README.md) | Berikutnya: [Projects](../projects/README.md)
