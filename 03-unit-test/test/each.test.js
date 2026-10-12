import { sumAll } from '../src/sum';

const table = [
  [[], 0],
  [[10], 10],
  [[10, 10], 20],
  [[10, 10, 10], 30],
  [[10, 10, 10, 10], 40],
];

test.each(table)('test sumAll(%s) should result %i', (input, expected) => {
  expect(sumAll(input)).toBe(expected);
});
