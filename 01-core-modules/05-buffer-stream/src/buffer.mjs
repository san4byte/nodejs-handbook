import { Buffer } from 'node:buffer';

const bufFromString = Buffer.from('Hello, Node.js!');
console.log('Byte length:', bufFromString.length);
console.log('Hex representation:', bufFromString.toString('hex'));
console.log('Base64 representation:', bufFromString.toString('base64'));

const restored = Buffer.from(bufFromString.toString('base64'), 'base64').toString('utf8');
console.log('Restored string:', restored);

const fixedBuf = Buffer.alloc(4);
fixedBuf.writeUInt8(65, 0); // 'A'
fixedBuf.writeUInt8(66, 1); // 'B'
console.log('Allocated buffer ASCII:', fixedBuf.subarray(0, 2).toString());
