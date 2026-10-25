import { once } from 'node:events';
import { Readable, Transform, Writable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';

// SOAL 1 (Dasar)
async function countStreamSize(readableStream) {
  let chunkByte = 0;

  for await (const chunk of readableStream) {
    chunkByte += Buffer.from(chunk).length;
  }

  return chunkByte;
}

const sampleStream = Readable.from(['Hello ', 'World']);
console.log('--- Soal 1 ---');
console.log(await countStreamSize(sampleStream));

// SOAL 2 (Menengah)
class PrefixTransform extends Transform {
  constructor(prefix) {
    super({ objectMode: true });
    this.prefix = prefix;
  }

  _transform(chunk, encoding, callback) {
    const chunks = chunk.toString().trim().split('\n');
    for (const value of chunks) {
      if (!value) continue;
      this.push(this.prefix + value + '\n');
    }
    callback();
  }
}

const auditSource = Readable.from(['Server running\nConnection established\n']);
const auditResults = [];
const auditDestination = new Writable({
  write(chunk, encoding, callback) {
    auditResults.push(chunk.toString());
    callback();
  },
});

await pipeline(auditSource, new PrefixTransform('[AUDIT] '), auditDestination);
console.log('\n--- Soal 2 ---');
console.log(auditResults.join('').trim());

// SOAL 3 (Menantang)
async function copyStreamThrottled(readable, writable, delayMs = 20) {
  let totalChunks = 0;

  try {
    for await (const chunk of readable) {
      const canContinue = writable.write(chunk);

      if (!canContinue) {
        await once(writable, 'drain');
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      totalChunks++;
    }

    writable.end();
    await finished(writable);

    return {
      success: true,
      totalChunks,
    };
  } catch (error) {
    if (!readable.destroyed) readable.destroy();
    if (!writable.destroyed) writable.destroy();
    throw error;
  }
}

// Uji Kasus Normal
const throttledSource = Readable.from(['packet-1', 'packet-2', 'packet-3']);
const throttledDestination = new Writable({
  highWaterMark: 10,
  write(chunk, encoding, callback) {
    setImmediate(callback);
  },
});

console.log('\n--- Soal 3 (Kasus Normal) ---');
const stats = await copyStreamThrottled(
  throttledSource,
  throttledDestination,
  10,
);
console.log(stats);

// Uji Kasus Error
const brokenSource = new Readable({
  read() {
    this.destroy(new Error('Source connection lost'));
  },
});
const errorDestination = new Writable({
  write(chunk, encoding, callback) {
    callback();
  },
});

console.log('\n--- Soal 3 (Kasus Error) ---');
try {
  await copyStreamThrottled(brokenSource, errorDestination, 10);
} catch (error) {
  console.log(error.message);
}
