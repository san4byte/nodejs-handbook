import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('sample.txt');
await fs.writeFile(file, 'Hello Node.js', 'utf8');

const content = await fs.readFile(file, 'utf8');
console.log('Read:', content);

await fs.unlink(file);
console.log('Unlink complete.');
