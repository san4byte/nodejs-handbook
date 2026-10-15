// 1. Cakupan globalThis
console.log('--- 1. Cakupan globalThis ---');
globalThis.appName = 'NodeHandbook';
const localName = 'SecretVar';
console.log({
  isEqualGlobal: globalThis === global,
  globalAppName: global.appName,
  localInGlobal: globalThis.localName,
});

// 2. Deep Clone (structuredClone)
console.log('\n--- 2. structuredClone ---');
const original = { user: 'Alice', prefs: { darkMode: true } };
const clone = structuredClone(original);
clone.prefs.darkMode = false;

let cloneError = null;
try {
  structuredClone({ fn: () => {} });
} catch (err) {
  cloneError = err.name;
}

console.log({
  originalDarkMode: original.prefs.darkMode,
  cloneDarkMode: clone.prefs.darkMode,
  uncloneableError: cloneError,
});

// 3. Durasi Presisi Tinggi (performance.now)
console.log('\n--- 3. performance.now ---');
const start = performance.now();
for (let i = 0; i < 50_000; i++) {}
console.log({
  elapsedMs: Number((performance.now() - start).toFixed(3)),
});

// 4. Konversi Biner Teks (TextEncoder & TextDecoder)
console.log('\n--- 4. TextEncoder & TextDecoder ---');
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const bytes = encoder.encode('Halo Node.js');
console.log({
  byteLength: bytes.byteLength,
  sampleBytes: Array.from(bytes.slice(0, 4)),
  decoded: decoder.decode(bytes),
});

// 5. Antrean Tugas Mikro (queueMicrotask)
console.log('\n--- 5. queueMicrotask vs Timer ---');
const executionOrder = [];
setTimeout(() => executionOrder.push('3. timer (macrotask)'), 10);
queueMicrotask(() => executionOrder.push('2. microtask'));
executionOrder.push('1. synchronous');

await new Promise((resolve) => setTimeout(resolve, 20));
console.log({ executionOrder });

// 6. Sinyal Pembatalan (AbortController)
console.log('\n--- 6. AbortController ---');
const controller = new AbortController();
const { signal } = controller;
const initialAborted = signal.aborted;
controller.abort('Operation cancelled by user');
console.log({
  initialAborted,
  afterAbort: signal.aborted,
  reason: signal.reason,
});
