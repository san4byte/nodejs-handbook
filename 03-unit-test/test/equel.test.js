test('test toBe()', () => {
  const name = 'joko';
  const hello = `hello ${name}`;

  expect(hello).toBe('hello joko');
});

test('test toEqual', () => {
  const person = { id: 1 };
  Object.assign(person, { name: 'joko santoso' });

  expect(person).toEqual({ id: 1, name: 'joko santoso' });
});
