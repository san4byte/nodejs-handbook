const buffer = Buffer.from('Joko Santoso', 'utf-8');

console.info(buffer.toString());
console.info(buffer.toString('base64'));
console.info(buffer.toString('hex'));

const bufferBase64 = Buffer.from('Sm9rbyBTYW50b3Nv', 'base64');
console.info(bufferBase64.toString('utf-8'));
