test('array simpel', () => {
  const names = ['joko', 'roy', 'samsul'];

  expect(names).toEqual(['joko', 'roy', 'samsul']);
  expect(names).toContain('joko');
});

test('array object', () => {
  const persons = [{ name: 'joko' }, { name: 'roy' }, { name: 'samsul' }];

  expect(persons).toEqual([{ name: 'joko' }, { name: 'roy' }, { name: 'samsul' }]);
  expect(persons).toContainEqual({ name: 'joko' });
});
