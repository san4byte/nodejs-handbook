function sayName() {
  return Promise.resolve('Joko');
}

const name = await sayName();
console.log(name);
