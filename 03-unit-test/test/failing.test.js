import { sayName } from '../src/sayHello';

test('should be succes func sayName()', () => {
  expect(sayName('Joko')).toBe('Hello Joko');
});

test('should be failed normal test', () => {
  expect(() => sayName()).toThrow();
});

test.failing('should be error no normal test', () => {
  sayName();
});
