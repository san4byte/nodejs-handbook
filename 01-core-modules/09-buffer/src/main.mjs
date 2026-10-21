import { Buffer } from 'node:buffer';

// 1. Inisialisasi Buffer dari Data Eksisting (Buffer.from)
console.log('--- 1. Inisialisasi Buffer dari Data Eksisting ---');
const textBuffer = Buffer.from('Node.js', 'utf-8');
const byteListBuffer = Buffer.from([78, 111, 100, 101]); // Nilai byte untuk 'Node'

console.log({
  rawTextBuffer: textBuffer,
  firstByteAscii: textBuffer[0],
  textByteLength: textBuffer.length,
  decodedByteList: byteListBuffer.toString('utf-8'),
});

// 2. Alokasi Memori Bersih vs Cepat (Buffer.alloc & allocUnsafe)
console.log('\n--- 2. Alokasi Memori Bersih vs Cepat ---');
const cleanBuffer = Buffer.alloc(4); // Terisi 0x00 secara aman
const filledBuffer = Buffer.alloc(3, 0xff); // Terisi 0xff secara kustom
const fastUnsafeBuffer = Buffer.allocUnsafe(4); // Alokasi cepat tanpa pembersihan

console.log({
  zeroFilledHex: cleanBuffer.toString('hex'),
  customFilledHex: filledBuffer.toString('hex'),
  fastAllocByteLength: fastUnsafeBuffer.length,
});

// 3. Konversi & Penerjemahan Encoding (buf.toString)
console.log('\n--- 3. Konversi & Penerjemahan Encoding ---');
const sampleBuffer = Buffer.from('Modern Backend', 'utf-8');

console.log({
  hexString: sampleBuffer.toString('hex'),
  base64String: sampleBuffer.toString('base64'),
  slicedUtf8String: sampleBuffer.toString('utf-8', 0, 6),
});

// 4. Penggabungan & Validasi Tipe (Buffer.concat & isBuffer)
console.log('\n--- 4. Penggabungan & Validasi Tipe ---');
const chunkA = Buffer.from('Hello ');
const chunkB = Buffer.from('World');
const mergedBuffer = Buffer.concat([chunkA, chunkB]);

const dummyString = 'not a buffer';

console.log({
  combinedText: mergedBuffer.toString('utf-8'),
  isMergedBuffer: Buffer.isBuffer(mergedBuffer),
  isStringBlocked: Buffer.isBuffer(dummyString),
});

// 5. Perhitungan Ukuran Byte Fisik Aktual (Buffer.byteLength)
console.log('\n--- 5. Perhitungan Ukuran Byte Fisik Aktual ---');
const accentWord = 'Café';
const emojiWord = 'Node 🚀';

console.log({
  accentCharLength: accentWord.length,
  accentByteLength: Buffer.byteLength(accentWord, 'utf-8'),
  emojiCharLength: emojiWord.length,
  emojiByteLength: Buffer.byteLength(emojiWord, 'utf-8'),
});

// 6. Manipulasi Irisan Memori Berbagi (buf.subarray)
console.log('\n--- 6. Manipulasi Irisan Memori Berbagi ---');
const parentBuffer = Buffer.from('ABC', 'utf-8');
const childSlice = parentBuffer.subarray(0, 1); // Mengiris byte pertama ('A')

childSlice[0] = 88; // Ubah nilai byte menjadi 'X' (ASCII 88)

console.log({
  childViewText: childSlice.toString('utf-8'),
  parentAffectedText: parentBuffer.toString('utf-8'),
  isSharedMemory: parentBuffer[0] === childSlice[0],
});
