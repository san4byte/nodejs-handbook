# Events (EventEmitter)

> Modul `node:events` menyediakan class `EventEmitter`, pondasi inti komunikasi asinkron berbasis publish/subscribe di Node.js yang dipakai oleh Streams, HTTP server, dan socket.

## Core Concepts

- Pola *Publisher/Subscriber*: objek memancarkan event bernama (`emit`), dan fungsi pendengar (`on`/`once`) merespons secara berurutan.
- Batas default maksimal listener adalah 10 per event untuk memperingatkan developer jika terjadi kebocoran memori (*memory leak*).
- Event `'error'` memiliki perilaku khusus: jika dipancarkan tanpa listener terdaftar, Node.js langsung melempar unhandled exception dan crash.
- Seluruh listener dipanggil secara sinkron sesuai urutan registrasi kecuali didesain asinkron secara eksplisit.

## Referensi

Daftar method class `EventEmitter` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `emitter.on(eventName, listener)` | Mendaftarkan listener yang dipanggil setiap kali event dipancarkan |
| `emitter.emit(eventName, ...args)` | Memicu eksekusi seluruh listener yang terdaftar dengan payload data |
| `emitter.once(eventName, listener)` | Mendaftarkan listener satu kali pakai yang otomatis dihapus setelah dipanggil |
| `emitter.off(eventName, listener)` | Menghapus fungsi listener spesifik dari suatu nama event |

### `emitter.on(eventName, listener)`

Metode ini mendaftarkan fungsi callback listener ke deretan pendengar untuk event yang ditentukan.

- `eventName` (string | symbol, required): Nama event yang didengarkan.
- `listener` ((...args: any[]) => void, required): Fungsi callback yang dieksekusi saat event dipancarkan.
- **Returns:** `EventEmitter`, instance emitter saat ini untuk pemanggilan berantai (*method chaining*).

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
bus.on('log', (message, level = 'INFO') => {
  console.log(`[${level}] ${message}`);
});

bus.emit('log', 'Application started');
// Output: [INFO] Application started
```

### `emitter.emit(eventName, ...args)`

Metode ini memicu seluruh listener yang terdaftar pada nama event secara sinkron sesuai urutan pendaftaran.

- `eventName` (string | symbol, required): Nama event yang dipicu.
- `...args` (any[], optional): Deretan argumen payload yang diteruskan langsung ke fungsi listener.
- **Returns:** boolean, bernilai `true` jika event memiliki listener terdaftar, atau `false` jika tidak ada pendengar.

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
bus.on('status', (code, detail) => console.log(`Status: ${code} - ${detail}`));

const hasListeners = bus.emit('status', 200, 'OK');
// Output: Status: 200 - OK
console.log('Delivered:', hasListeners);
// Output: Delivered: true
```

### `emitter.once(eventName, listener)`

Metode ini mendaftarkan listener satu kali pakai yang langsung dilepas segera setelah pemanggilan pertamanya selesai.

- `eventName` (string | symbol, required): Nama event target.
- `listener` ((...args: any[]) => void, required): Fungsi callback yang hanya dijalankan satu kali.
- **Returns:** `EventEmitter`, instance emitter saat ini.

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
bus.once('init', (version) => console.log('Init version:', version));

bus.emit('init', '1.0.0');
bus.emit('init', '1.0.1');
// Output: Init version: 1.0.0
```

### `emitter.off(eventName, listener)`

Metode ini (alias dari `removeListener`) menghapus listener tertentu dari daftar event aktif.

- `eventName` (string | symbol, required): Nama event target.
- `listener` ((...args: any[]) => void, required): Referensi fungsi callback yang sebelumnya didaftarkan.
- **Returns:** `EventEmitter`, instance emitter saat ini.

```js
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
const handlePing = () => console.log('PONG');

bus.on('ping', handlePing);
bus.off('ping', handlePing);

bus.emit('ping');
console.log('Active listeners:', bus.listenerCount('ping'));
// Output: Active listeners: 0
```

## Examples

### 1. Order Processing with Lifecycle Events

```js title="src/emitter.mjs"
// run: node src/emitter.mjs
import { EventEmitter } from 'node:events';

class OrderProcessor extends EventEmitter {
  placeOrder(orderId, amount) {
    console.log(`Order ${orderId} received.`);
    this.emit('created', { orderId, amount });
  }
}

const processor = new OrderProcessor();
processor.on('created', (order) => {
  console.log(`[Notification] Order ${order.orderId} processed ($${order.amount}).`);
});
processor.once('created', (order) => {
  console.log(`[Analytics] First order recorded: ${order.orderId}.`);
});
processor.on('error', (err) => {
  console.log('[Error Listener] Caught error:', err.message);
});

processor.placeOrder('ORD-101', 50);
// Output: Order ORD-101 received.
// Output: [Notification] Order ORD-101 processed ($50).
// Output: [Analytics] First order recorded: ORD-101.

processor.placeOrder('ORD-102', 120);
// Output: Order ORD-102 received.
// Output: [Notification] Order ORD-102 processed ($120).

processor.emit('error', new Error('Payment gateway timeout'));
// Output: [Error Listener] Caught error: Payment gateway timeout
```

## Real-World Use Case

**Backend**

**Masalah:** setelah pembayaran selesai, notifikasi email dan audit inventory harus dikirim tanpa mengotori domain logic pembayaran.
**Solusi:** pancarkan custom event menggunakan `EventEmitter` agar listener decoupled dapat memproses tugas sampingan secara modular.

```js title="order-events.mjs"
import { EventEmitter } from 'node:events';

class CheckoutService extends EventEmitter {
  completePayment(orderId, amount) {
    this.emit('payment:success', { orderId, amount });
  }
}

const checkout = new CheckoutService();

checkout.on('payment:success', ({ orderId, amount }) => {
  console.log(`[Email] Invoice sent for ${orderId}: $${amount}`);
});

checkout.on('payment:success', ({ orderId }) => {
  console.log(`[Inventory] Deducting stock for ${orderId}`);
});

checkout.completePayment('ORD-999', 250);
// Output: [Email] Invoice sent for ORD-999: $250
// Output: [Inventory] Deducting stock for ORD-999
```

## Pitfalls

- Memancarkan event `'error'` tanpa mendaftarkan listener `'error'` menyebabkan uncaught exception yang menghentikan proses Node.js.
  ```js
  // ❌ Incorrect: crash because no listener registered for 'error'
  const bus = new EventEmitter();
  bus.emit('error', new Error('Failed to connect'));

  // ✅ Correct: register error listener before emitting
  const bus = new EventEmitter();
  bus.on('error', (err) => console.log('Handled safely:', err.message));
  bus.emit('error', new Error('Failed to connect'));
  // Output: Handled safely: Failed to connect
  ```
- Menghapus listener menggunakan anonymous function tidak akan berhasil karena referensi memori berbeda.
  ```js
  // ❌ Incorrect: different anonymous function reference
  bus.on('data', () => console.log('Data'));
  bus.off('data', () => console.log('Data')); // Listener remains active!

  // ✅ Correct: keep named function reference
  const onData = () => console.log('Data');
  bus.on('data', onData);
  bus.off('data', onData); // Successfully removed
  ```

## References

- [Node.js Docs: Events](https://nodejs.org/api/events.html)

---

Sebelumnya: [03 - File System](../03-fs/README.md) | Berikutnya: [05 - Buffer & Stream](../05-buffer-stream/README.md)
