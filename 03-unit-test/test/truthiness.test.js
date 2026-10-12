test('truthiness', () => {
  let value = null;
  expect(value).toBeDefined();
  expect(value).toBeNull();
  expect(value).toBeFalsy();

  value = undefined;
  expect(value).toBeUndefined();
  expect(value).toBeFalsy();
  expect(value).toBeUndefined();

  value = 'Joko';
  expect(value).toBe('Joko');
  expect(value).toBeTruthy();
});
