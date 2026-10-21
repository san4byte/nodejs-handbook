import { Buffer } from 'node:buffer';

// SOAL 1
function convertTextToHex(text) {
  return Buffer.from(text, 'utf-8').toString('hex');
}

console.log(convertTextToHex('Node'));

// SOAL 2
function concatBinaryPackets(stringList) {
  const bufferArray = [];
  for (const value of stringList || []) {
    const valueNewLine = value + '\n';
    bufferArray.push(Buffer.from(valueNewLine));
  }

  return Buffer.concat(bufferArray);
}

console.log(concatBinaryPackets(['Alpha', 'Beta']));

// SOAL 3
function parseBinaryPacket(packet) {
  if (!Buffer.isBuffer(packet) || packet.length < 3) {
    return {
      valid: false,
      reason: 'Invalid packet header',
    };
  }

  const magicByte = packet[0];
  const encodingType = packet[1];
  const payloadLength = packet[2]; // <-- Ambil panjang data dari byte ke-2

  if (magicByte !== 0xaa) {
    return {
      valid: false,
      reason: 'Invalid magic byte',
    };
  }

  // Cek apakah data fisiknya kurang dari (3 byte header + payloadLength)
  if (packet.length < 3 + payloadLength) {
    return {
      valid: false,
      reason: 'Truncated packet data',
    };
  }

  // Potong tepat dari byte ke-3 sepanjang payloadLength
  const resultValue = packet.subarray(3, 3 + payloadLength);

  if (encodingType === 1) {
    return {
      valid: true,
      encoding: 'utf-8',
      data: resultValue.toString('utf-8'),
    };
  } else if (encodingType === 2) {
    return {
      valid: true,
      encoding: 'base64',
      data: resultValue.toString('base64'),
    };
  } else {
    return {
      valid: false,
      reason: 'Unsupported encoding',
    };
  }
}

const textPayload = Buffer.from('NodeJS', 'utf-8');
const packet1 = Buffer.concat([
  Buffer.from([0xaa, 1, textPayload.length]),
  textPayload,
]);

console.log(parseBinaryPacket(packet1));

const b64Payload = Buffer.from('secret_token', 'utf-8');
const packet2 = Buffer.concat([
  Buffer.from([0xaa, 2, b64Payload.length]),
  b64Payload,
]);

console.log(parseBinaryPacket(packet2));

const invalidMagicPacket = Buffer.from([0xff, 1, 0]);

console.log(parseBinaryPacket(invalidMagicPacket));

// Header menyatakan payload 10 byte, namun hanya ada 2 byte fisik di buffer
const truncatedPacket = Buffer.from([0xaa, 1, 10, 0x48, 0x69]);

console.log(parseBinaryPacket(truncatedPacket));
