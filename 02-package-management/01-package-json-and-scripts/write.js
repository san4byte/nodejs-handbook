import fs from 'node:fs';

export const writeToFile = (file, content) => {
  fs.writeFileSync(file, content);
};
