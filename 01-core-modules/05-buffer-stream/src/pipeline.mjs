import { Readable, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const sourceStream = Readable.from(['alpha\n', 'beta\n', 'gamma\n']);

const upperTransform = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

const output = [];
const destinationStream = new Writable({
  write(chunk, encoding, callback) {
    output.push(chunk.toString());
    callback();
  },
});

await pipeline(sourceStream, upperTransform, destinationStream);

console.log('Processed Stream Chunks:');
process.stdout.write(output.join(''));
