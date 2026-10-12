import { writeToFile } from './write.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'data', 'export.log');

writeToFile(logFile, 'export hello world.\n');
console.log('Eksekusi export.js sukses. Pesan ditulis ke data/export.log');
