import util from 'node:util';

const firstName = 'joko';
const lastName = 'santoso';

console.info(`hallo ${firstName} ${lastName}`);
console.info(util.format('hallo %s %s', firstName, lastName));

const person = {
  firstName: 'samsul',
  lastName: 'hadi',
};

console.info(`Person: ${JSON.stringify(person)}`);
console.info(util.format('Person: %j', person));
