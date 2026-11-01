import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });
const answer = await rl.question('siapa nama Anda? ');
console.log(`nama saya ${answer}`);

rl.close();
