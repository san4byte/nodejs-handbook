export const sayHelloAsync = (name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (name) {
        resolve(`Hello ${name}`);
      } else {
        reject('name harus ada.');
      }
    }, 1000);
  });
};
