import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import { Readable, Transform, Writable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';

// 1. Pembacaan Sumber Data Bertahap (Readable.from & for await...of)
console.log('--- 1. Pembacaan Sumber Data Bertahap ---');
const textSource = Readable.from(['Node.js ', 'Stream ', 'Engine']);
const collectedChunks = [];

for await (const chunk of textSource) {
  collectedChunks.push(chunk);
}

console.log({
  totalChunks: collectedChunks.length,
  combinedText: collectedChunks.join(''),
});

// 2. Penulisan ke Tujuan Data (Writable Stream)
console.log('\n--- 2. Penulisan ke Tujuan Data ---');
const inMemorySink = [];
const customWriter = new Writable({
  write(chunk, encoding, callback) {
    inMemorySink.push(chunk.toString());
    callback();
  },
});

customWriter.write('Log 1\n');
customWriter.write('Log 2\n');
customWriter.end();
await finished(customWriter);

console.log({
  writtenCount: inMemorySink.length,
  data: inMemorySink.join('').trim(),
});

// 3. Modifikasi Data saat Mengalir (Transform Stream)
console.log('\n--- 3. Modifikasi Data saat Mengalir ---');
const upperTransformer = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

const transformedChunks = [];
const transformSink = new Writable({
  write(chunk, encoding, callback) {
    transformedChunks.push(chunk.toString());
    callback();
  },
});

await pipeline(
  Readable.from(['alpha', 'beta']),
  upperTransformer,
  transformSink,
);

console.log({
  transformedText: transformedChunks.join('-'),
});

// 4. Orkestrasi Aliran Aman Tanpa Bocor (pipeline)
console.log('\n--- 4. Orkestrasi Aliran Aman ---');
const itemCollector = [];
const pipelineSink = new Writable({
  write(chunk, encoding, callback) {
    itemCollector.push(chunk.toString());
    callback();
  },
});

await pipeline(Readable.from(['order-1', 'order-2', 'order-3']), pipelineSink);

console.log({
  pipelineSuccess: true,
  itemsProcessed: itemCollector.length,
});

// 5. Kendali Tekanan Balik (Backpressure & Drain)
console.log('\n--- 5. Kendali Tekanan Balik ---');
let drainTriggered = false;
const throttledWriter = new Writable({
  highWaterMark: 10,
  write(chunk, encoding, callback) {
    setImmediate(callback);
  },
});

const canAcceptFirst = throttledWriter.write('packet-1');
const canAcceptSecond = throttledWriter.write('packet-2');

if (!canAcceptSecond) {
  await once(throttledWriter, 'drain');
  drainTriggered = true;
}
throttledWriter.end();
await finished(throttledWriter);

console.log({
  canAcceptFirst,
  canAcceptSecond,
  drainTriggered,
});

// 6. Implementasi Stream pada File System (node:fs)
console.log('\n--- 6. Implementasi Stream pada File System ---');
const targetPath = path.join(import.meta.dirname, 'data', 'target-stream.log');
const fileWriter = fs.createWriteStream(targetPath);
fileWriter.write('Stream Log Entry\n');
fileWriter.end();
await finished(fileWriter);

const fileReader = fs.createReadStream(targetPath);
const fileChunks = [];
for await (const chunk of fileReader) {
  fileChunks.push(chunk.toString());
}

console.log({
  isReadableSubclass: fileReader instanceof Readable,
  isWritableSubclass: fileWriter instanceof Writable,
  fileContent: fileChunks.join('').trim(),
});
