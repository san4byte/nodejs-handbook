import { writeToFile } from './write.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'data', 'hello.log');

writeToFile(logFile, 'hello world from npm scripts!\n');
console.log('Eksekusi index.js sukses. Pesan ditulis ke data/hello.log');
