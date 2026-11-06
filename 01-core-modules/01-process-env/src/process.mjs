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

process.env.APP_NAME = 'PaymentGateway';
process.env.APP_PORT = '3000';
console.log(process.env.WKWKWKW); // undefined
console.log(process.env.APP_PORT); // 3000

const array = ['AB', 'CD'];
console.log(array.join(', '));
