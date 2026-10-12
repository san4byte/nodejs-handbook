/**
 * 02 - Globals in Node.js Modern Runtime
 *
 * Demonstrasi objek dan fungsi yang tersedia secara global di Node.js
 * tanpa perlu melakukan import / require.
 */

console.log('=== 1. Standar Global Root ===');
console.log('globalThis === global:', globalThis === global); // true di Node.js

console.log('\n=== 2. Objek Global Web-Standard yang Tersedia di Node.js ===');
// URL & URLSearchParams
const myUrl = new URL('https://example.com/api?user=joko');
console.log('Built-in URL host :', myUrl.host);

// Structured Clone (Deep Copy native tanpa lodash)
const originalData = {
  user: 'Joko',
  settings: {
    theme: 'dark',
  },
};
const clonedData = structuredClone(originalData);
clonedData.settings.theme = 'light';
console.log('Original theme    :', originalData.settings.theme); // dark (tidak terpengaruh)
console.log('Cloned theme      :', clonedData.settings.theme); // light

// High-Resolution Performance API
console.log('\n=== 3. Performance Web API ===');
const timeMark = performance.now();
console.log(
  'Waktu runtime saat ini (performance.now):',
  timeMark.toFixed(2),
  'ms',
);

// TextEncoder & TextDecoder
const encoder = new TextEncoder();
const bytes = encoder.encode('Halo Node.js!');
console.log('Encoded bytes via TextEncoder:', bytes);

const decoder = new TextDecoder();
const decodedText = decoder.decode(bytes);
console.log('Decoded text via TextDecoder :', decodedText);

console.log(
  '\n=== 4. Demonstrasi Prioritas Eksekusi: Microtask vs Macrotask ===',
);
console.log('[1] Sinkron: Baris pertama dijalankan langsung');

setTimeout(() => {
  console.log(
    '[4] Macrotask: setTimeout(..., 0) dieksekusi di putaran Event Loop berikutnya',
  );
}, 0);

queueMicrotask(() => {
  console.log(
    '[3] Microtask: queueMicrotask() dieksekusi SEBELUM macrotask selesai!',
  );
});

console.log('[2] Sinkron: Baris terakhir selesai dibaca');

console.log('\n=== 5. Kesimpulan ===');
console.log('✓ Node.js modern telah mengadopsi standar Web API global.');
console.log(
  '✓ queueMicrotask() memberi prioritas eksekusi tinggi tanpa overhead objek Promise.',
);
console.log(
  '✓ Hindari menyimpan state manual ke globalThis agar terhindar dari memory leak.',
);
