import { spawn } from 'node:child_process';

const child = spawn('node', [
  '-e',
  'console.log("Child process output"); console.log("More text");',
]);

child.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    console.log(`STDOUT: ${line}`);
  }
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
