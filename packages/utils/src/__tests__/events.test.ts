import { createEvents } from '../events';

let counter: number;
const increment = () => {
  counter += 1;
};

describe('eventEmitter', () => {
  beforeEach(() => {
    counter = 0;
  });

  describe('on', () => {
    test('normal', () => {
      const eventEmitter = createEvents();

      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);

      eventEmitter.emit('add');

      expect(counter).toBe(3);

      eventEmitter.emit('add');

      expect(counter).toBe(6);
    });

    test('complex', () => {
      const eventEmitter = createEvents();

      eventEmitter.on('add', increment);
      eventEmitter.on('add1', increment);
      eventEmitter.on('add2', increment);
      eventEmitter.on('add', increment);

      eventEmitter.emit('add');

      expect(counter).toBe(2);
      eventEmitter.emit('add1');
      expect(counter).toBe(3);
      eventEmitter.emit('add2');
      expect(counter).toBe(4);
    });
  });

  describe('off', () => {
    test('normal', () => {
      const eventEmitter = createEvents();
      const off = eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      off();

      eventEmitter.emit('add');
      expect(counter).toBe(2);

      eventEmitter.emit('add');
      expect(counter).toBe(4);
    });

    test('complex', () => {
      const eventEmitter = createEvents();
      const off = eventEmitter.on('add', increment);
      const off1 = eventEmitter.on('add1', increment);
      const off2 = eventEmitter.on('add2', increment);
      eventEmitter.on('add', increment);
      off();

      eventEmitter.emit('add');

      expect(counter).toBe(1);

      eventEmitter.emit('add1');

      expect(counter).toBe(2);

      off1();
      off2();

      eventEmitter.emit('add2');
      expect(counter).toBe(2);
    });
  });
});
