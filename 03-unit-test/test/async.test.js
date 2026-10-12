import { sayHelloAsync } from '../src/async';

test('async function', async () => {
  const result = await sayHelloAsync('Joko');
  expect(result).toBe('Hello Joko');
});

test('async mathers', async () => {
  await expect(sayHelloAsync('Joko')).resolves.toBe('Hello Joko');
  await expect(sayHelloAsync()).rejects.toBe('name harus ada.');
});
