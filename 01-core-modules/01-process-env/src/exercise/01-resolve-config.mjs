import process from 'node:process';

function resolveAppConfig(defaultPort = 3000) {
  const args = process.argv.slice(2);
  const indexPort = args.indexOf('--port');
  const cliPort = indexPort !== -1 ? args[indexPort + 1] : undefined;

  const port = Number(cliPort ?? process.env.PORT ?? defaultPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid port number');
  }

  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';

  return {
    port,
    env,
    isProduction,
  };
}

console.log('=== TEST SOAL 1: resolveAppConfig ===');

// Simpan state asli agar bisa dipulihkan kembali
const originalArgv = [...process.argv];
const originalEnv = { ...process.env };

function resetTestEnvironment() {
  process.argv = ['node', '01-resolve-config.mjs'];
  delete process.env.PORT;
  delete process.env.NODE_ENV;
}

// Skenario 1: Default fallback (tanpa CLI args dan tanpa env)
resetTestEnvironment();
const test1 = resolveAppConfig();
console.log('Test 1 (Default):', test1);
// Expected: { port: 3000, env: 'development', isProduction: false }

// Skenario 2: Custom defaultPort
resetTestEnvironment();
const test2 = resolveAppConfig(5000);
console.log('Test 2 (Custom Default):', test2);
// Expected: { port: 5000, env: 'development', isProduction: false }

// Skenario 3: Simulasi CLI argument (--port 6000) dan NODE_ENV='production'
resetTestEnvironment();
process.argv = ['node', '01-resolve-config.mjs', '--port', '6000'];
process.env.NODE_ENV = 'production';
const test3 = resolveAppConfig();
console.log('Test 3 (CLI & Env):', test3);
// Expected: { port: 6000, env: 'production', isProduction: true }

// Skenario 4: Environment variable PORT override defaultPort
resetTestEnvironment();
process.env.PORT = '8080';
process.env.NODE_ENV = 'production';
const test4 = resolveAppConfig(5000);
console.log('Test 4 (Env Override):', test4);
// Expected: { port: 8080, env: 'production', isProduction: true }

// Skenario 5: CLI Flag memiliki prioritas lebih tinggi daripada process.env.PORT
resetTestEnvironment();
process.argv = ['node', '01-resolve-config.mjs', '--port', '4200'];
process.env.PORT = '8080';
const test5 = resolveAppConfig();
console.log('Test 5 (CLI Priority over Env):', test5);
// Expected: { port: 4200, env: 'development', isProduction: false }

// Skenario 6: Error jika port bukan angka
resetTestEnvironment();
try {
  resolveAppConfig('not-a-number');
  console.error('Test 6 FAILED: Should throw error');
} catch (err) {
  console.log('Test 6 (Invalid Type Caught):', err.message);
  // Expected: Invalid port number
}

// Skenario 7: Error jika port di luar range (1 - 65535)
resetTestEnvironment();
try {
  resolveAppConfig(99999);
  console.error('Test 7 FAILED: Should throw error');
} catch (err) {
  console.log('Test 7 (Out of Range Caught):', err.message);
  // Expected: Invalid port number
}

// Pulihkan environment asli
process.argv = originalArgv;
process.env = originalEnv;
