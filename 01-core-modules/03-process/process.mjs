/**
 * 02 - Process Demonstration (Industry Standard)
 *
 * Demonstrasi menyeluruh objek process di tingkat industri:
 * 1. Inspeksi Metadata & Resource Usage (Memory Profiling & CPU Time)
 * 2. High-Resolution Benchmarking (nanoseconds via hrtime)
 * 3. Environment & Parameter Handling
 * 4. Error Trapping (uncaughtException & unhandledRejection)
 * 5. Production Graceful Shutdown (SIGINT & SIGTERM Handling)
 */

import process from 'node:process';
import { parseArgs } from 'node:util';

console.log('=== 1. Process Identity & Runtime Metadata ===');
console.log('Node.js Version :', process.version);
console.log('Process ID (PID):', process.pid);
console.log('Platform / Arch :', `${process.platform} (${process.arch})`);
console.log('Current Working Dir:', process.cwd());
console.log('Raw Arguments (argv):', process.argv.slice(2));

console.log('\n=== 2. Memory & Resource Profiling (SRE Metrics) ===');
const mem = process.memoryUsage();
console.table({
  'RSS (Resident Set Size)': `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
  'Heap Total': `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  'Heap Used': `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  'External (C++ Memory)': `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
  ArrayBuffers: `${(mem.arrayBuffers / 1024 / 1024).toFixed(2)} MB`,
});

console.log('\n=== 3. High-Resolution Benchmarking (hrtime) ===');
const start = process.hrtime.bigint();
// Simulasi kalkulasi komputasi
let sum = 0;
for (let i = 0; i < 1_000_000; i++) {
  sum += i;
}
const end = process.hrtime.bigint();
const durationNs = end - start;
const durationMs = Number(durationNs) / 1_000_000;
console.log(
  `Kalkulasi selesai. Durasi: ${durationMs.toFixed(3)} ms (${durationNs} nanodetik)`,
);

console.log('\n=== 4. Modern CLI Argument Parsing (parseArgs) ===');
// Memanfaatkan utilitas parsing argumen bawaan Node.js modern
try {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      port: { type: 'string', short: 'p', default: '3000' },
      env: { type: 'string', short: 'e', default: 'development' },
      debug: { type: 'boolean', short: 'd', default: false },
    },
    allowPositionals: true,
  });
  console.log('Parsed Options     :', values);
  console.log('Positional Argumen :', positionals);
} catch (err) {
  console.warn('Peringatan parsing argumen:', err.message);
}

console.log('\n=== 5. Environment Configuration ===');
const port = process.env.PORT || 8080;
const appEnv = process.env.NODE_ENV || 'development';
console.log(`Konfigurasi Aplikasi: PORT=${port}, NODE_ENV=${appEnv}`);

console.log('\n=== 6. Graceful Shutdown & Signal Trapping Demo ===');
function handleGracefulShutdown(signal) {
  console.log(
    `\n[SHUTDOWN] Menerima sinyal ${signal}. Menutup koneksi & membersihkan resource...`,
  );
  // Logika pelepasan resource (tutup database, stop accept HTTP request)
  console.log('[SHUTDOWN] Seluruh resource berhasil dibersihkan.');
  process.exit(0);
}

// Menangkap sinyal terminasi sistem
process.on('SIGINT', () => handleGracefulShutdown('SIGINT')); // Ctrl + C di terminal
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM')); // Perintah kill dari Docker / Kubernetes

// Menangkap unhandled exception agar aplikasi mencatat log sebelum crash
process.on('uncaughtException', (err, origin) => {
  console.error(`[FATAL] Uncaught Exception pada ${origin}:`, err.message);
  process.exit(1);
});

// Menangkap unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection pada Promise:', reason);
  process.exit(1);
});

console.log('✓ Listener sinyal SIGINT/SIGTERM & error trap siap.');
console.log('✓ Skrip selesai dieksekusi dengan status normal.');
