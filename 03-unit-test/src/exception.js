export class MyException extends Error {}

export const callMe = (name) => {
  if (name === 'Joko') {
    throw new MyException('Ups my exception heppens!');
  } else {
    return 'Ok';
  }
};
