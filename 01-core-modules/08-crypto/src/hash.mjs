import crypto from 'node:crypto';

const text = 'secret message';
const hash = crypto.createHash('sha256').update(text).digest('hex');
console.log('SHA-256 Hash length:', hash.length);
console.log('SHA-256 Hash sample:', hash.slice(0, 16));

const id = crypto.randomUUID();
console.log('Valid UUID v4:', typeof id === 'string');
