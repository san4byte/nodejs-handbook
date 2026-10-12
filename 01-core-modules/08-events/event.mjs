import { EventEmitter } from 'node:events';

const emiter = new EventEmitter();

// addListener(eventName, listener)
emiter.addListener('hello', (name) => {
    console.info(`hello ${name}`);
});

emiter.addListener('hello', (name) => {
    console.info(`hallo ${name}`);
});

// emit(eventName, args)
emiter.emit('hello', 'joko');
