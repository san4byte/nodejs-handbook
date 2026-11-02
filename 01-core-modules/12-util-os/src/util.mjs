import util from 'node:util';
import os from 'node:os';

const status = util.styleText('green', 'ONLINE');
console.log(`Node app: [${status}]`);

console.log('Available cores > 0:', os.availableParallelism() > 0);
console.log('OS Platform:', os.platform());
