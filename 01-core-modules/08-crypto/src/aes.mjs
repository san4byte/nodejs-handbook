import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(12);

function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { encrypted, tag };
}

function decrypt(encryptedText, authTagHex) {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const originalMessage = 'Secret payment transaction payload';
const { encrypted, tag } = encrypt(originalMessage);
console.log('Encrypted text length:', encrypted.length);
console.log('Auth tag length:', tag.length);

const decrypted = decrypt(encrypted, tag);
console.log('Decrypted matches original:', decrypted === originalMessage);
