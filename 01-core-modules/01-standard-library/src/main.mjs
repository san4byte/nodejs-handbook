import { isBuiltin, builtinModules } from 'node:module';

// 1. Validasi Modul Bawaan (isBuiltin)
console.log('--- 1. Validasi Modul Bawaan ---');
console.log({
  'node:fs': isBuiltin('node:fs'),
  fs: isBuiltin('fs'),
  express: isBuiltin('express'),
});

// 2. Statistik Modul Bawaan
console.log('\n--- 2. Statistik Modul Bawaan ---');
const publicModules = builtinModules.filter((name) => !name.startsWith('_'));
console.log({
  totalBuiltins: builtinModules.length,
  publicBuiltins: publicModules.length,
  sampleModules: publicModules.slice(0, 5),
});

// 3. Skema Awalan node:
console.log('\n--- 3. Skema Awalan node: ---');
try {
  await import('node:non_existent_module');
} catch (error) {
  console.log({
    catchErrorCode: error.code,
  });
}
