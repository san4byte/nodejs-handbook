import { EventEmitter } from 'node:events';

class OrderProcessor extends EventEmitter {
  placeOrder(orderId, amount) {
    console.log(`Order ${orderId} received.`);
    this.emit('created', { orderId, amount });
  }
}

const processor = new OrderProcessor();

// Standard listener
processor.on('created', (order) => {
  console.log(`[Notification] Order ${order.orderId} processed ($${order.amount}).`);
});

// One-time listener
processor.once('created', (order) => {
  console.log(`[Analytics] First order recorded: ${order.orderId}.`);
});

// Error handling
processor.on('error', (err) => {
  console.log('[Error Listener] Caught error:', err.message);
});

processor.placeOrder('ORD-101', 50);
processor.placeOrder('ORD-102', 120);

// Emitting safe handled error
processor.emit('error', new Error('Payment gateway timeout'));
