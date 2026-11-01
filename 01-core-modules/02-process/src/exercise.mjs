// SOAL 1
function formatMemoryStatistics() {
  const memory = process.memoryUsage();

  return {
    rssMb: Number((memory.rss / 1024 / 1024).toFixed(2)),
    heapTotalMb: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
    heapUsedMb: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
  };
}

console.log(formatMemoryStatistics());

// SOAL 2
function measureFunctionLatency(targetFunction) {
  const start = process.hrtime.bigint();
  const result = targetFunction();
  const end = process.hrtime.bigint();

  return {
    result,
    durationMicroseconds: Number(end - start) / 1_000,
  };
}

console.log(
  measureFunctionLatency(() => {
    let count = 0;
    for (let i = 0; i < 10_000; i++) count += i;
    return count;
  }),
);

// SOAL 3
function initializeApplication(envSchema) {
  const config = {};
  const errors = [];

  for (const [key, expectedValue] of Object.entries(envSchema)) {
    const envValue = process.env[key];

    if (envValue === undefined || envValue === '') {
      errors.push(`${key} is required`);
      continue;
    }

    if (expectedValue === 'number') {
      const parsedNumber = Number(envValue);
      if (Number.isNaN(parsedNumber) || !Number.isFinite(parsedNumber)) {
        errors.push(`${key} must be a valid number`);
      } else {
        config[key] = parsedNumber;
      }
    } else if (expectedValue === 'string') {
      config[key] = envValue;
    }
  }

  if (errors.length > 0) {
    process.exitCode = 1;
    return { ready: false, errors };
  }

  process.once('SIGINT', () => {
    process.exitCode = 0;
  });

  return { ready: true, config };
}

process.env.PORT = '0';
process.env.DATABASE_URL = 'postgres://localhost/db';

// delete process.env.DATABASE_URL;
// process.env.PORT = 'not-a-number';

console.log(initializeApplication({ PORT: 'number', DATABASE_URL: 'string' }));
