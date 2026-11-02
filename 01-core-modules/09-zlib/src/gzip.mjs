import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

const sampleText = 'Node.js Handbook Compression '.repeat(14);
const compressedGzip = await gzip(Buffer.from(sampleText));
const decompressedGzip = await gunzip(compressedGzip);
const compressedBrotli = await brotliCompress(Buffer.from(sampleText));
const decompressedBrotli = await brotliDecompress(compressedBrotli);

console.log('Original size (bytes):', Buffer.from(sampleText).length);
console.log('Gzip compressed size:', compressedGzip.length);
console.log('Gzip decompressed matches:', decompressedGzip.toString() === sampleText);
console.log('Brotli compressed size:', compressedBrotli.length);
console.log('Brotli decompressed matches:', decompressedBrotli.toString() === sampleText);
