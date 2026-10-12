import { callMe, MyException } from '../src/exception';

test('exception', () => {
  //! callMe('Joko');
  //! expect(callMe('Joko'));

  expect(() => callMe('Joko')).toThrow();
  expect(() => callMe('Joko')).toThrow(MyException);
  expect(() => callMe('Joko')).toThrow('Ups my exception heppens!');
});

test('exeption Ok', () => {
  expect(callMe('Budi')).toBe('Ok');
});
