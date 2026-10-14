import process from 'node:process';

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

console.log('\n=== 4. CLI Argument Inspection & Parsing (process.argv) ===');
// Parsing argumen baris perintah manual menggunakan process.argv
const rawArgs = process.argv.slice(2);
const parsedOptions = {
  port: '3000',
  env: 'development',
  debug: false,
};
const positionals = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    parsedOptions.port = rawArgs[++i] || parsedOptions.port;
  } else if (arg === '--env' || arg === '-e') {
    parsedOptions.env = rawArgs[++i] || parsedOptions.env;
  } else if (arg === '--debug' || arg === '-d') {
    parsedOptions.debug = true;
  } else if (!arg.startsWith('-')) {
    positionals.push(arg);
  }
}
console.log('Parsed Options     :', parsedOptions);
console.log('Positional Argumen :', positionals);

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
