import { getFileBuilder, defineFile } from '../index';
import {
  resetFs,
  sleep,
  recursiveReadDir,
  readFile,
  writeFile
} from './helper';
import { reactive } from '@vue/reactivity';

jest.mock('fs');

afterEach(() => {
  resetFs();
});

describe.skip('fileBuilder', () => {
  describe('build without dependencies, basic scene', () => {
    test('should create file and use getContent after build', async () => {
      const fileBuilder = getFileBuilder();
      const { addFile, build, getContent, close } = fileBuilder;
      const a = defineFile({
        name: 'a',
        content() {
          return 'file a';
        }
      });
      const b = defineFile({
        name: 'b',
        async content() {
          await sleep(100);
          return 'file b';
        }
      });
      const v = defineFile({
        virtual: true,
        content() {
          return { hello: 'world' };
        }
      });
      addFile(a, b, v);
      await build();
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b']);
      expect(await readFile('/a')).toEqual('file a');
      expect(await readFile('/b')).toEqual('file b');
      expect(getContent(a)).toEqual('file a');
      expect(getContent(b)).toEqual('file b');
      expect(getContent(v)).toEqual({ hello: 'world' });
      await close();
    });

    test('should delete file and should not use getContent after close', async () => {
      const fileBuilder = getFileBuilder();
      const { addFile, build, getContent, close } = fileBuilder;
      const a = defineFile({
        name: 'a',
        content() {
          return 'file a';
        }
      });
      const b = defineFile({
        name: 'b',
        async content() {
          await sleep(100);
          return 'file b';
        }
      });
      const v = defineFile({
        virtual: true,
        content() {
          return { hello: 'world' };
        }
      });
      addFile(a, b, v);
      await build();
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b']);
      await close();
      const newFiles = await recursiveReadDir('/');
      expect(newFiles.length).toEqual(0);
      expect(getContent(a)).toBeUndefined();
      expect(getContent(b)).toBeUndefined();
      expect(getContent(v)).toBeUndefined();
    });
  });

  describe('build with dependencies', () => {
    test('should create files in the order of dependencies', async () => {
      jest.spyOn(console, 'log');
      const fileBuilder = getFileBuilder();
      const { addFile, build } = fileBuilder;
      const A = defineFile({
        name: 'a',
        content() {
          console.log('a start');
          console.log('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          console.log('b start');
          await sleep(200);
          console.log('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          console.log('c start');
          await sleep(100);
          console.log('c end');
          return 'C';
        },
        dependencies: [B]
      });
      addFile(A, B, C);
      await build('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b', 'c']);
      expect(await readFile('/a')).toEqual('A');
      expect(await readFile('/b')).toEqual('B');
      expect(await readFile('/c')).toEqual('c');
      expect(console.log).toHaveBeenNthCalledWith(1, 'a start');
      expect(console.log).toHaveBeenNthCalledWith(2, 'a end');
      expect(console.log).toHaveBeenNthCalledWith(3, 'b start');
      expect(console.log).toHaveBeenNthCalledWith(4, 'b end');
      expect(console.log).toHaveBeenNthCalledWith(5, 'c start');
      expect(console.log).toHaveBeenNthCalledWith(6, 'c end');
    });

    test('should create files in parallel if a file has multiple dependents', async () => {
      jest.spyOn(console, 'log');
      const fileBuilder = getFileBuilder();
      const { addFile, build } = fileBuilder;
      const A = defineFile({
        name: 'a',
        content() {
          console.log('a start');
          console.log('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          console.log('b start');
          await sleep(200);
          console.log('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          console.log('c start');
          await sleep(100);
          console.log('c end');
          return 'C';
        },
        dependencies: [A]
      });
      addFile(A, B, C);
      await build('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b', 'c']);
      expect(await readFile('/a')).toEqual('A');
      expect(await readFile('/b')).toEqual('B');
      expect(await readFile('/c')).toEqual('c');
      expect(console.log).toHaveBeenNthCalledWith(1, 'a start');
      expect(console.log).toHaveBeenNthCalledWith(2, 'a end');
      expect(console.log).toHaveBeenNthCalledWith(3, 'b start');
      expect(console.log).toHaveBeenNthCalledWith(4, 'c start');
      expect(console.log).toHaveBeenNthCalledWith(5, 'c end');
      expect(console.log).toHaveBeenNthCalledWith(6, 'b end');
    });

    test('a file should not be created until all its dependencies are created', async () => {
      jest.spyOn(console, 'log');
      const fileBuilder = getFileBuilder();
      const { addFile, build } = fileBuilder;
      const A = defineFile({
        name: 'a',
        content() {
          console.log('a start');
          console.log('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          console.log('b start');
          await sleep(200);
          console.log('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          console.log('c start');
          await sleep(100);
          console.log('c end');
          return 'C';
        },
        dependencies: [B]
      });

      const D = defineFile({
        name: 'd',
        content() {
          console.log('d start');
          console.log('d end');
          return 'D';
        },
        dependencies: [B, C]
      });
      addFile(A, B, C, D);
      await build('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b', 'c', 'd']);
      expect(await readFile('/a')).toEqual('A');
      expect(await readFile('/b')).toEqual('B');
      expect(await readFile('/c')).toEqual('c');
      expect(await readFile('/d')).toEqual('d');
      expect(console.log).toHaveBeenNthCalledWith(1, 'a start');
      expect(console.log).toHaveBeenNthCalledWith(2, 'a end');
      expect(console.log).toHaveBeenNthCalledWith(3, 'b start');
      expect(console.log).toHaveBeenNthCalledWith(4, 'c start');
      expect(console.log).toHaveBeenNthCalledWith(5, 'c end');
      expect(console.log).toHaveBeenNthCalledWith(6, 'b end');
      expect(console.log).toHaveBeenNthCalledWith(7, 'd start');
      expect(console.log).toHaveBeenNthCalledWith(8, 'd end');
    });
  });

  /** TODO: reactive support */
  describe.skip('watch with reactive', () => {
    test('should update file after changing state', async () => {
      const fileBuilder = getFileBuilder();
      const { addFile, watch, getContent, close } = fileBuilder;
      const state = reactive({ content: 'a' });
      const test = defineFile({
        name: 'test',
        content() {
          return state.content;
        }
      });
      addFile(test);
      await watch();
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['test']);
      expect(await readFile('/test')).toEqual('a');
      expect(getContent(test)).toEqual('a');
      state.content = 'b';
      await Promise.resolve();
      expect(await readFile('/test')).toEqual('b');
      expect(getContent(test)).toEqual('b');
      await close();
    });
  });

  describe('watch with dependencies', () => {
    test('should update file by the order of dependencies after one updates', async () => {
      const fileBuilder = getFileBuilder();
      const { addFile, getContent, watch } = fileBuilder;
      const src = '/src';
      await writeFile(src, 'a');
      const A = defineFile({
        name: 'a',
        async content() {
          return await readFile(src);
        },
        dependencies: [src]
      });

      const B = defineFile({
        name: 'b',
        content() {
          return getContent(A) + ' b';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        content() {
          return getContent(B) + ' c';
        },
        dependencies: [B]
      });
      addFile(A, B, C);
      await watch('/');
      const files = await recursiveReadDir('/');
      expect(files).toEqual(['a', 'b', 'c']);
      expect(await readFile('/a')).toEqual('a');
      expect(await readFile('/b')).toEqual('a b');
      expect(await readFile('/c')).toEqual('a b c');

      await writeFile(src, 'aa');
      await Promise.resolve();

      const newFiles = await recursiveReadDir('/');
      expect(newFiles).toEqual(['a', 'b', 'c']);
      expect(await readFile('/a')).toEqual('aa');
      expect(await readFile('/b')).toEqual('aa b');
      expect(await readFile('/c')).toEqual('aa b c');
    });
  });
});
