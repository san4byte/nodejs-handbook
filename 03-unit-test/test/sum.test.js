import { sum, sumAll } from '../src/sum';

test('test sum function', () => {
  const result = sum(1, 2);
  expect(result).toBe(3);
});

test('test sum function 2', () => {
  const result = sum(1, 2);
  expect(result).toBe(3);
});

test('test sum function 3', () => {
  const result = sum(1, 2);
  expect(result).toBe(3);
});

test('test summAll', () => {
  expect(sumAll([1, 1, 1, 1, 1])).toBe(5);
});
