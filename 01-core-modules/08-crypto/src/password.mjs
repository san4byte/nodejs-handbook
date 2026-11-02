import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

const password = 'mySecretPassword123';
const hashed = await hashPassword(password);
console.log('Password hashed format:', hashed.split(':')[0].length === 32);

const isMatch = await verifyPassword('mySecretPassword123', hashed);
console.log('Correct password matches:', isMatch);

const isWrong = await verifyPassword('wrongPassword', hashed);
console.log('Wrong password matches:', isWrong);
