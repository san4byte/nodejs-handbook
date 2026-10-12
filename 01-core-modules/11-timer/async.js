function sayName() {
  return Promise.resolve('Joko');
}

async function run() {
  const name = await sayName();
  console.log(name);
}

run();

// ! error
// const name = await sayName();
// console.log(name);
