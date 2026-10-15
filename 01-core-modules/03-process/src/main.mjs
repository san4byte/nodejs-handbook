import process from 'node:process';

// 1. Identitas & Jalur Runtime
console.log('--- 1. Identitas & Jalur Runtime ---');
console.log({
  pid: process.pid,
  version: process.version,
  platformArch: `${process.platform} (${process.arch})`,
  cwd: process.cwd(),
  uptimeSec: Number(process.uptime().toFixed(2)),
});

// 2. Argumen CLI & Environment
console.log('\n--- 2. Argumen & Environment ---');
console.log({
  args: process.argv.slice(2),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
});

// 3. Profiling Memori (MB)
console.log('\n--- 3. Penggunaan Memori (MB) ---');
const mem = process.memoryUsage();
const toMb = (bytes) => Number((bytes / 1024 / 1024).toFixed(2));
console.log({
  rssMb: toMb(mem.rss),
  heapTotalMb: toMb(mem.heapTotal),
  heapUsedMb: toMb(mem.heapUsed),
  externalMb: toMb(mem.external),
});

// 4. Benchmarking Presisi Tinggi (hrtime)
console.log('\n--- 4. Benchmarking Presisi Tinggi ---');
const startHr = process.hrtime.bigint();
let count = 0;
for (let i = 0; i < 200_000; i++) count += i;
const durationNs = process.hrtime.bigint() - startHr;
console.log({
  nanoseconds: durationNs.toString(),
  milliseconds: Number((Number(durationNs) / 1e6).toFixed(3)),
});

// 5. Lifecycle & Sinyal OS
console.log('\n--- 5. Lifecycle & Sinyal OS ---');
process.on('SIGINT', () => {
  process.exit(0);
});
process.on('SIGTERM', () => {
  process.exit(0);
});

console.log({
  activeListeners: {
    SIGINT: process.listenerCount('SIGINT'),
    SIGTERM: process.listenerCount('SIGTERM'),
  },
  exitCode: process.exitCode ?? 0,
});
