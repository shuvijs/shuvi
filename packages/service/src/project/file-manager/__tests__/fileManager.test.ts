import {
  getFileManager,
  createFile,
  reactive,
  onMounted,
  onUnmounted
} from '../index';
import { resetFs, recursiveReadDir, readFile } from './helper/fs';
import { waitForUpdate } from './helper/wait-for-update';

jest.mock('fs');

afterEach(resetFs);

describe('fileManager', () => {
  describe('basic', () => {
    test('should create file after mount', async () => {
      const fileManager = getFileManager({ watch: false });
      fileManager.addFile({
        name: 'a',
        content() {
          return 'file a';
        }
      });
      fileManager.addFile({
        name: 'b',
        content() {
          return 'file b';
        }
      });
      await fileManager.mount('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b']);
      expect(await readFile('/a')).toEqual('file a');
      expect(await readFile('/b')).toEqual('file b');
    });

    test('should update file after changing state', async () => {
      const fileManager = getFileManager({ watch: true });
      const state = reactive({
        content: 'a'
      });
      fileManager.addFile({
        name: 'test',
        content() {
          return state.content;
        }
      });
      await fileManager.mount('/');
      expect(await readFile('/test')).toEqual('a');

      return waitForUpdate(() => {
        state.content = 'b';
      })
        .then(async () => {
          expect(await readFile('/test')).toEqual('b');
        })
        .endPromise();
    });

    test('should not update file after changing state', async () => {
      const fileManager = getFileManager({ watch: false });
      const state = reactive({
        content: 'a'
      });
      fileManager.addFile({
        name: 'test',
        content() {
          return state.content;
        }
      });
      await fileManager.mount('/');
      expect(await readFile('/test')).toEqual('a');

      return waitForUpdate(() => {
        state.content = 'b';
      })
        .then(async () => {
          expect(await readFile('/test')).toEqual('a');
        })
        .endPromise();
    });

    test('should delete file after unmount', async () => {
      const fileManager = getFileManager({ watch: false });
      fileManager.addFile({
        name: 'a',
        content() {
          return 'file a';
        }
      });
      fileManager.addFile({
        name: 'b',
        content() {
          return 'file b';
        }
      });
      await fileManager.mount('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b']);
      expect(true).toBe(true);

      await fileManager.unmount();
      const newFiles = await recursiveReadDir('/');
      expect(newFiles.length).toEqual(0);
    });

    test('should excute mounted and unmounted in watch mode', async () => {
      const fileManager = getFileManager({ watch: true });
      let something = 0;
      fileManager.addFile({
        name: 'test',
        content() {
          return 'a';
        },
        mounted: () => {
          something = 1;
        },
        unmounted: () => {
          something = 2;
        }
      });
      await fileManager.mount('/');
      expect(something).toEqual(1);
      expect(await readFile('/test')).toEqual('a');
      await fileManager.unmount();
      expect(something).toEqual(2);
    });

    test('should not excute mounted and unmounted in static mode', async () => {
      const fileManager = getFileManager({ watch: false });
      let something = 0;
      fileManager.addFile({
        name: 'test',
        content() {
          return 'a';
        },
        mounted: () => {
          something = 1;
        },
        unmounted: () => {
          something = 2;
        }
      });
      await fileManager.mount('/');
      expect(something).toEqual(0);
      expect(await readFile('/test')).toEqual('a');
      await fileManager.unmount();
      expect(something).toEqual(0);
    });

    describe('onMount/onUnmount', () => {
      test('should work', async () => {
        const fileManager = getFileManager({ watch: true });
        let something = 0;
        fileManager.addFile({
          name: 'test',
          setup() {
            onMounted(() => {
              something = 1;
            });
            onUnmounted(() => {
              something = 2;
            });
          },
          content() {
            return 'a';
          }
        });
        await fileManager.mount('/');
        expect(something).toEqual(1);
        expect(await readFile('/test')).toEqual('a');
        await fileManager.unmount();
        expect(something).toEqual(2);
      });
    });
  });

  describe('createFile should work without watching files', () => {
    describe('should work without using context', () => {
      test('should create file after mount', async () => {
        const fileManager = getFileManager({ watch: false });
        fileManager.addFile(
          createFile({
            name: 'a',
            content() {
              return 'file a';
            }
          })
        );
        fileManager.addFile({
          name: 'b',
          content() {
            return 'file b';
          }
        });
        await fileManager.mount('/');
        const files = await recursiveReadDir('/');
        expect(files).toEqual(['a', 'b']);
        expect(await readFile('/a')).toEqual('file a');
        expect(await readFile('/b')).toEqual('file b');
      });

      test('should update file after changing state', async () => {
        const fileManager = getFileManager({ watch: true });
        const state = reactive({
          content: 'a'
        });
        fileManager.addFile(
          createFile({
            name: 'test',
            content() {
              return state.content;
            }
          })
        );
        await fileManager.mount('/');
        expect(await readFile('/test')).toEqual('a');

        return waitForUpdate(() => {
          state.content = 'b';
        })
          .then(async () => {
            expect(await readFile('/test')).toEqual('b');
          })
          .endPromise();
      });

      test('should not update file after changing state', async () => {
        const fileManager = getFileManager({ watch: false });
        const state = reactive({
          content: 'a'
        });
        fileManager.addFile(
          createFile({
            name: 'test',
            content() {
              return state.content;
            }
          })
        );
        await fileManager.mount('/');
        expect(await readFile('/test')).toEqual('a');

        return waitForUpdate(() => {
          state.content = 'b';
        })
          .then(async () => {
            expect(await readFile('/test')).toEqual('a');
          })
          .endPromise();
      });
    });

    describe('should work with using context', () => {
      test('should update file after changing state', async () => {
        const context = reactive({ source: 'a' });
        type Context = typeof context;
        const fileManager = getFileManager({ watch: true, context });
        fileManager.addFile(
          createFile<Context>({
            name: 'test',
            content: context => {
              return context.source;
            }
          })
        );
        await fileManager.mount('/');
        expect(await readFile('/test')).toEqual('a');

        return waitForUpdate(() => {
          context.source = 'b';
        })
          .then(async () => {
            expect(await readFile('/test')).toEqual('b');
          })
          .endPromise();
      });
      test('should update file after changing state when using initializer', async () => {
        const context = reactive({ source: 'c' });
        type Context = typeof context;
        const fileManager = getFileManager({ watch: true, context });
        fileManager.addFile(
          createFile<Context>(context => {
            return {
              content: () => {
                return context.source;
              }
            };
          }, 'test')
        );
        await fileManager.mount('/');
        expect(await readFile('/test')).toEqual('c');

        return waitForUpdate(() => {
          context.source = 'd';
        })
          .then(async () => {
            expect(await readFile('/test')).toEqual('d');
          })
          .endPromise();
      });
    });
  });
});
