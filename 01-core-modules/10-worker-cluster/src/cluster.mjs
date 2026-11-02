import cluster from 'node:cluster';
import process from 'node:process';

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running.`);
  // Fork 2 workers
  const worker1 = cluster.fork();
  const worker2 = cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code}.`);
  });

  // Terminate workers after demonstration
  setTimeout(() => {
    worker1.kill();
    worker2.kill();
  }, 100);
} else {
  console.log(`Worker ${process.pid} started.`);
}
