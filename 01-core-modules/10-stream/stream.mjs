import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'data', 'target-stream.log');

// 1. Writable Stream: Menulis data sepotong demi sepotong (chunks)
const writer = fs.createWriteStream(logFile);
writer.write('Joko\n');
writer.write('Santoso\n');
writer.write('Stream Engineer\n');
writer.end();

// 2. Readable Stream: Membaca data sepotong demi sepotong
writer.on('finish', () => {
  const reader = fs.createReadStream(logFile);
  reader.on('data', (chunk) => {
    console.info('Menerima chunk data:');
    console.info(chunk.toString());
  });
  reader.on('end', () => {
    console.info('Pembacaan stream selesai.');
  });
});
