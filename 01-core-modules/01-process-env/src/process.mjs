// run: node src/process.mjs --port 8080
import process from 'node:process';

const userArgs = process.argv.slice(2);
const env = process.env.NODE_ENV || 'development';

console.log('PID is number:', typeof process.pid === 'number');
// Output: PID is number: true
console.log('Platform:', process.platform);
// Output: Platform: linux
console.log('Raw Arguments:', userArgs);
// Output: Raw Arguments: [ '--port', '8080' ]
console.log('Environment:', env);
// Output: Environment: development
