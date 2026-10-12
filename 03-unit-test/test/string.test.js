test('string metcher', () => {
  const name = 'Joko Santoso';

  expect(name).toBe('Joko Santoso');
  expect(name).toMatch(/San/);
});
