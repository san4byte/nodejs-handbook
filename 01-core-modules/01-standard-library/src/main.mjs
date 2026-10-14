import { isBuiltin, builtinModules } from 'node:module';

console.log(typeof isBuiltin); // function

try {
  await import('node:non_existent_core_module');
} catch (error) {
  console.log(error.code);
}

console.log(isBuiltin('node:module')); // true
console.log(isBuiltin('node:url')); // true
console.log(isBuiltin('fs')); // true
console.log(isBuiltin('express')); // false

console.table(builtinModules); // [...]
const publicModules = builtinModules.filter((name) => !name.startsWith('_'));
console.table(publicModules);
