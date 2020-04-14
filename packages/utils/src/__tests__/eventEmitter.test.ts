import emitter from '../eventEmitter';

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
      const eventEmitter = emitter();

      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);

      eventEmitter.emit('add');

      expect(counter).toBe(3);

      eventEmitter.emit('add');

      expect(counter).toBe(6);
    });

    test('complex', () => {
      const eventEmitter = emitter();

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
      const eventEmitter = emitter();
      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      eventEmitter.on('add', increment);
      eventEmitter.off('add', increment);

      eventEmitter.emit('add');
      expect(counter).toBe(2);

      eventEmitter.emit('add');
      expect(counter).toBe(4);
    });

    test('complex', () => {
      const eventEmitter = emitter();
      eventEmitter.on('add', increment);
      eventEmitter.on('add1', increment);
      eventEmitter.on('add2', increment);
      eventEmitter.on('add', increment);
      eventEmitter.off('add', increment);

      eventEmitter.emit('add');

      expect(counter).toBe(1);

      eventEmitter.emit('add1');

      expect(counter).toBe(2);

      eventEmitter.off('add1', increment);
      eventEmitter.off('add2', increment);
      eventEmitter.emit('add2');

      expect(counter).toBe(2);
    });
  });
});
