import { sumAll } from '../src/sum';

const table = [
  { inputs: [10], expected: 10 },
  { inputs: [10, 10], expected: 20 },
  { inputs: [10, 10, 10], expected: 30 },
  { inputs: [10, 10, 10, 10], expected: 40 },
];

test.each(table)('test sumAll($inputs) should result $expected', ({ inputs, expected }) => {
  expect(sumAll(inputs)).toBe(expected);
});
