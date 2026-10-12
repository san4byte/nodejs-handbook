import { sum } from '../src/sum';

beforeAll(() => {
  console.log('Before All');
});

afterAll(() => {
  console.log('After All');
});

beforeEach(() => {
  console.log('Befor Each');
});

afterEach(() => {
  console.log('After Each');
});

test('first test', () => {
  expect(sum(2, 2)).toBe(4);
  console.log('first test');
});
test('second test', () => {
  expect(sum(2, 2)).toBe(4);
  console.log('second test');
});
