import { Console } from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'data', 'console.log');

const file = fs.createWriteStream(logFile);

const log = new Console({
  stdout: file,
  stderr: file,
});

const person = {
  name: 'Joko Santoso',
  age: 21,
};

log.info('hello world');
log.error('Error: hello world');
log.table(person);
