import process from 'node:process';

function validateRuntimeEnvironment(requiredEnvKeys) {
  if (!Array.isArray(requiredEnvKeys)) {
    throw new TypeError('requiredEnvKeys must be an array of strings');
  }

  const missingKeys = [];

  for (const key of requiredEnvKeys) {
    const val = process.env[key];

    if (val === undefined || val === null || val.trim() === '') {
      missingKeys.push(key);
    }
  }

  if (missingKeys.length > 0) {
    console.error(
      `[ERROR] Missing required environment variables: ${missingKeys.join(', ')}`,
    );
    process.exitCode = 1;
    return false;
  }

  console.log(`[INFO] Platform: ${process.platform}`);
  console.log(`[INFO] Working Directory: ${process.cwd()}`);
  process.exitCode = 0;
  return true;
}

console.log('=== TEST SOAL 2: validateRuntimeEnvironment ===');

const originalEnv = { ...process.env };

const originalExitCode = process.exitCode;

function resetEnv() {
  process.exitCode = undefined;
}

// Skenario 1: Semua key valid
resetEnv();
process.env.APP_NAME = 'PaymentGateway';
process.env.APP_PORT = '3000';
const test1 = validateRuntimeEnvironment(['APP_NAME', 'APP_PORT']);
console.log('Test 1 (Valid) Result:', test1);
console.log('Test 1 ExitCode:', process.exitCode ?? 0);
// Expected:
// [INFO] Platform: linux (atau darwin/win32)
// [INFO] Working Directory: ...
// Test 1 (Valid) Result: true
// Test 1 ExitCode: 0

// Skenario 2: Key tidak disetel (undefined)
resetEnv();
delete process.env.SECRET_KEY;
const test2 = validateRuntimeEnvironment(['APP_NAME', 'SECRET_KEY']);
console.log('Test 2 (Missing) Result:', test2);
console.log('Test 2 ExitCode:', process.exitCode);
// Expected:
// [ERROR] Missing required environment variables: SECRET_KEY
// Test 2 (Missing) Result: false
// Test 2 ExitCode: 1

// Skenario 3: Key bernilai string kosong atau hanya spasi
resetEnv();
process.env.EMPTY_TOKEN = '   ';
const test3 = validateRuntimeEnvironment(['EMPTY_TOKEN']);
console.log('Test 3 (Whitespace) Result:', test3);
console.log('Test 3 ExitCode:', process.exitCode);
// Expected:
// [ERROR] Missing required environment variables: EMPTY_TOKEN
// Test 3 (Whitespace) Result: false
// Test 3 ExitCode: 1

// Skenario 4: Multi key hilang sekaligus
resetEnv();
delete process.env.KEY_A;
delete process.env.KEY_B;
const test4 = validateRuntimeEnvironment(['KEY_A', 'KEY_B']);
console.log('Test 4 (Multi Missing) Result:', test4);
console.log('Test 4 ExitCode:', process.exitCode);
// Expected:
// [ERROR] Missing required environment variables: KEY_A, KEY_B
// Test 4 (Multi Missing) Result: false
// Test 4 ExitCode: 1

// Pulihkan environment asli
process.env = originalEnv;
process.exitCode = originalExitCode;
