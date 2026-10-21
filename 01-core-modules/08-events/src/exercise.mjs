import EventEmitter from 'node:events';

// SOAl 1
class AlarmSystem extends EventEmitter {
  trigger(location) {
    this.emit('alarm', {
      location,
      timestamp: '2026-10-12T00:00:00.000Z',
    });
  }
}

const alarm = new AlarmSystem();
alarm.on('alarm', (info) => console.log(info));
alarm.trigger('Warehouse B');

// SOAL 2
class DownloadQueue extends EventEmitter {
  files = [];

  addTask(fileName) {
    this.files.push(fileName);
  }

  execute() {
    for (const value of this.files) {
      this.emit('progress', value);
    }

    this.emit('complete', this.files);
  }
}

const queue = new DownloadQueue();
queue.addTask('photo.jpg');
queue.addTask('archive.zip');

queue.on('progress', (filename) => console.log('Processing:', filename));
queue.on('complete', (files) => console.log('Total files:', files.length));

queue.execute();

// SOAL 3
class ReliableTaskEmitter extends EventEmitter {
  async runTask(taskName, taskFn, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await taskFn();
        this.emit('success', result);
        return;
      } catch (error) {
        lastError = error;
        this.emit('retry', { taskName, attempt });
      }
    }
    this.emit('error', lastError);
  }
}

const emitter = new ReliableTaskEmitter();
let count = 0;

emitter.on('retry', (data) => console.log('Retrying:', data));
emitter.on('success', (result) => console.log('Result:', result));
emitter.on('error', (err) => console.log('Fatal error:', err.message));

await emitter.runTask('calculation', async () => {
  count++;
  if (count < 2) throw new Error('Temporary failure');
  return 42;
});

await emitter.runTask(
  'network',
  async () => {
    throw new Error('Server unreachable');
  },
  2,
);
