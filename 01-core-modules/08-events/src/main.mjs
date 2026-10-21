import { EventEmitter, once } from 'node:events';

// 1. Registrasi & Pemancaran Event Standar (on & emit)
console.log('--- 1. Registrasi & Pemancaran Event Standar ---');
const standardEmitter = new EventEmitter();
const receivedMessages = [];

standardEmitter.on('message', (payload) => {
  receivedMessages.push(payload);
});

const hasDelivered = standardEmitter.emit('message', 'System initialized');
const hasNoListeners = standardEmitter.emit('unregistered', 'Ghost message');

console.log({
  delivered: hasDelivered,
  unhandledDelivered: hasNoListeners,
  messages: receivedMessages,
});

// 2. Listener Sekali Pakai (once)
console.log('\n--- 2. Listener Sekali Pakai ---');
const lifecycleEmitter = new EventEmitter();
const activationLogs = [];

lifecycleEmitter.once('start', (serviceName) => {
  activationLogs.push(`Started ${serviceName}`);
});

lifecycleEmitter.emit('start', 'AuthService');
lifecycleEmitter.emit('start', 'PaymentService');

console.log({
  totalActivations: activationLogs.length,
  logs: activationLogs,
});

// 3. Pencopotan Listener & Pembersihan (off & removeAllListeners)
console.log('\n--- 3. Pencopotan Listener & Pembersihan ---');
const cleanupEmitter = new EventEmitter();
const metrics = [];

const tracker = (metricName) => {
  metrics.push(metricName);
};

cleanupEmitter.on('metric', tracker);
cleanupEmitter.emit('metric', 'cpu_spike');

cleanupEmitter.off('metric', tracker);
cleanupEmitter.emit('metric', 'memory_spike');

cleanupEmitter.on('metric', () => {});
cleanupEmitter.on('status', () => {});
const listenerCountBeforeWipe = cleanupEmitter.listenerCount('metric');
cleanupEmitter.removeAllListeners('metric');
const listenerCountAfterWipe = cleanupEmitter.listenerCount('metric');

console.log({
  collectedMetrics: metrics,
  listenerCountBeforeWipe,
  listenerCountAfterWipe,
});

// 4. Audit Listener & Batas Ambang Memori (listenerCount & setMaxListeners)
console.log('\n--- 4. Audit Listener & Batas Ambang Memori ---');
const auditEmitter = new EventEmitter();

auditEmitter.setMaxListeners(25);
auditEmitter.on('ping', () => {});
auditEmitter.on('ping', () => {});

console.log({
  maxListeners: auditEmitter.getMaxListeners(),
  pingListenersCount: auditEmitter.listenerCount('ping'),
  unregisteredListenersCount: auditEmitter.listenerCount('pong'),
});

// 5. Penanganan Khusus Event Error ('error' Event)
console.log('\n--- 5. Penanganan Khusus Event Error ---');
const errorEmitter = new EventEmitter();
const capturedErrors = [];

errorEmitter.on('error', (err) => {
  capturedErrors.push(err.message);
});

errorEmitter.emit('error', new Error('Database connection failed'));

console.log({
  handledErrorsCount: capturedErrors.length,
  lastErrorMessage: capturedErrors[0],
});

// 6. Penantian Event Asinkron Berbasis Promise (events.once)
console.log('\n--- 6. Penantian Event Asinkron Berbasis Promise ---');
const asyncWorker = new EventEmitter();

setTimeout(() => {
  asyncWorker.emit('finished', { taskId: 'TASK-101', status: 'completed' });
}, 10);

const [taskResult] = await once(asyncWorker, 'finished');

console.log({
  resolvedTaskId: taskResult.taskId,
  taskStatus: taskResult.status,
});
