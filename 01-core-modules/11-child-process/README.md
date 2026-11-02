# Child Process

> Modul `node:child_process` memungkinkan aplikasi Node.js mengeksekusi binary atau perintah eksternal sistem operasi, mengalirkan data I/O standar (stdio), serta berkomunikasi antar proses.

## Core Concepts

- `spawn()` mengalirkan input/output melalui stream (`stdout`/`stderr`), cocok untuk proses berdurasi panjang atau output berukuran besar tanpa memakan buffer memori heap.
- `exec()` menjalankan perintah di dalam shell (`/bin/sh` atau `cmd.exe`) dan menampung seluruh output ke buffer memori. Rentan terhadap *command injection*.
- `execFile()` mengeksekusi file executable langsung tanpa perantara shell, lebih aman dari injeksi perintah berbahaya.
- `fork()` adalah varian khusus `spawn()` untuk menjalankan proses Node.js lain dengan jalur komunikasi IPC bawaan.

## Referensi

Daftar fungsi modul `node:child_process` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `spawn(command, args?, options?)` | Menjalankan proses baru dengan streaming I/O standar dan konfigurasi proses |
| `exec(command, options?, callback?)` | Menjalankan perintah di dalam shell dan mengumpulkan output ke callback |
| `execFile(file, args?, options?, callback?)` | Menjalankan binary langsung tanpa shell wrapper |

### `spawn(command, args?, options?)`

Fungsi ini mengeksekusi binary eksternal secara asinkron berbasis streaming.

- `command` (string, required): Nama perintah atau jalur binary yang dieksekusi (misalnya `'node'` atau `'git'`).
- `args` (string[], optional): Deretan argumen baris perintah terpisah.
- `options` (SpawnOptions, optional): Opsi proses seperti `cwd` (string), `env` (object), dan `stdio` (string | array).
- **Returns:** `ChildProcess`, instance proses anak dengan stream `stdout` dan `stderr`.

```js
import { spawn } from 'node:child_process';

const child = spawn('node', ['-e', 'console.log("Spawned OK")'], {
  stdio: 'pipe',
});

child.stdout.on('data', (chunk) => console.log(chunk.toString().trim()));
// Output: Spawned OK
```

### `exec(command, options?, callback?)`

Fungsi ini mengeksekusi baris perintah lengkap di dalam sub-shell sistem operasi dan menampung seluruh output ke buffer memori.

- `command` (string, required): String perintah lengkap yang dieksekusi.
- `options` (ExecOptions, optional): Batasan eksekusi seperti `timeout` (number dalam ms) dan `maxBuffer` (ukuran buffer byte, default 1 MB).
- `callback` ((error: Error | null, stdout: string, stderr: string) => void, optional): Callback penerima seluruh buffer output.
- **Returns:** `ChildProcess`, instance proses anak.

```js
import { exec } from 'node:child_process';

exec('node -v', { timeout: 3000 }, (err, stdout) => {
  console.log('Valid version:', stdout.trim().startsWith('v'));
});
// Output: Valid version: true
```

### `execFile(file, args?, options?, callback?)`

Fungsi ini memanggil berkas executable secara langsung tanpa menginstansiasi shell perantara, menjadikannya lebih aman dari injeksi perintah.

- `file` (string, required): Jalur executable yang dipanggil.
- `args` (string[], optional): Array parameter baris perintah.
- `options` (ExecFileOptions, optional): Opsi konfigurasi seperti `cwd`, `env`, dan `maxBuffer`.
- `callback` ((error: Error | null, stdout: string, stderr: string) => void, optional): Callback penerima keluaran proses.
- **Returns:** `ChildProcess`.

```js
import { execFile } from 'node:child_process';

execFile('node', ['--version'], (err, stdout) => {
  console.log('Version detected:', stdout.trim().startsWith('v'));
});
// Output: Version detected: true
```

## Examples

### 1. Eksekusi Perintah Streaming Menggunakan Spawn

```js title="src/spawn.mjs"
// run: node src/spawn.mjs
import { spawn } from 'node:child_process';

const child = spawn('node', [
  '-e',
  'console.log("Child process output"); console.log("More text");',
]);

child.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    console.log(`STDOUT: ${line}`);
  }
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
// Output: STDOUT: Child process output
// Output: STDOUT: More text
// Output: Child process exited with code 0
```

## Real-World Use Case

**Tooling**

**Masalah:** aplikasi background job perlu menjalankan binary eksternal untuk konversi dokumen tanpa memuat keluaran raksasa ke RAM Node.js dan tanpa membahayakan sistem dari celah shell injection.
**Solusi:** gunakan `spawn()` dengan argumen array terpisah dan tangani stream `stdout` serta penutupan exit code secara terstruktur.

```js title="binary-runner.mjs"
import { spawn } from 'node:child_process';

function runBinary(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args);
    let output = '';

    child.stdout.on('data', (chunk) => (output += chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}

const version = await runBinary('node', ['-v']);
console.log('Binary executed safely:', version.startsWith('v'));
// Output: Binary executed safely: true
```

## Pitfalls

- Menggabungkan input pengguna mentah ke dalam fungsi `exec()`. Hal ini memicu celah fatal *Command Injection*. Selalu gunakan `spawn()` atau `execFile()` dengan array argumen.
  ```js
  // ❌ Incorrect: vulnerable to command injection like 'foo.txt; rm -rf /'
  // exec(`cat ${userInput}`);

  // ✅ Correct: parameters are strictly isolated in array arguments
  spawn('cat', [userInput]);
  ```
- Lupa menangani event `child.on('error', ...)` ketika binary yang dipanggil tidak ditemukan di `$PATH` sistem (`ENOENT`).
  ```js
  // ❌ Incorrect: uncaught exception if binary missing
  const child = spawn('unknown-command-xyz');

  // ✅ Correct: listen to error event
  child.on('error', (err) => {
    console.log('Binary execution failed:', err.code);
  });
  ```

## References

- [Node.js Docs: Child Process](https://nodejs.org/api/child_process.html)

---

Sebelumnya: [10 - Worker & Cluster](../10-worker-cluster/README.md) | Berikutnya: [12 - Util & OS](../12-util-os/README.md)
