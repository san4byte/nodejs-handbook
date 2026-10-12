function tagFunction(array, ...args) {
  console.info(array);
  console.info(args);
}

test("tag function", () => {
  const firstName = "Joko";
  const lastName = "Santoso";

  tagFunction`Hello ${firstName} ${lastName}!, How are you?`;
  // [ 'Hello ', ' ', '!, How are you?' ] -> array
  // [ 'Joko', 'Santoso' ] -> args
  tagFunction`By ${firstName} ${lastName}!, See yiu latter`;
  // [ 'By ', ' ', '!, See yiu latter' ] -> array
  // [ 'Joko', 'Santoso' ] -> args
});

test("tag function sql", () => {
  const name = "Joko; DROP table users";
  const age = 21;

  tagFunction`SELECT * FROM users WHERE name = ${name} AND age = ${age}`;
  // [ 'SELECT * FROM users WHERE name = ', ' AND age = ', '' ] -> array
  // [ 'Joko; DROP table users', 21 ] -> args
});
