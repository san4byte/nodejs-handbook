import process from 'node:process';

const args = process.argv.slice(2);
const port = Number(process.env.PORT || args[1]) || 3000;
const env = process.env.NODE_ENV || 'development';

console.log('PID is number:', typeof process.pid === 'number');
console.log('Platform:', process.platform);
console.log('Target Port:', port);
console.log('Environment:', env);
console.log('Raw Arguments:', args);
