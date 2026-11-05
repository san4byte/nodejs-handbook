// run: node src/config.mjs
import process from 'node:process';

function loadConfig(env = process.env) {
  const errors = [];

  // 1. Mandatory variable
  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === '') {
    errors.push('DATABASE_URL is required but missing');
  }

  // 2. Whitelist validation
  const allowedEnvs = ['development', 'production', 'test'];
  const nodeEnv = env.NODE_ENV || 'development';
  if (!allowedEnvs.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of [${allowedEnvs.join(', ')}], received '${nodeEnv}'`);
  }

  // 3. Strict port validation
  let port = 3000;
  if (env.PORT !== undefined) {
    const parsed = Number(env.PORT);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      errors.push(`PORT must be an integer (1-65535), received '${env.PORT}'`);
    } else {
      port = parsed;
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exitCode = 1;
    return null;
  }

  return { port, nodeEnv, databaseUrl: env.DATABASE_URL };
}

const config = loadConfig({
  PORT: '8080',
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://localhost:5432/db',
});
console.log('Config loaded successfully:', config !== null);
// Output: Config loaded successfully: true

const invalidConfig = loadConfig({ PORT: 'invalid_port' });
console.log('Invalid config blocked:', invalidConfig === null && process.exitCode === 1);
// Output: Invalid config blocked: true
