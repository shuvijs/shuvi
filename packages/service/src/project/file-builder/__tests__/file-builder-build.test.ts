import path from 'path';
import { getFileBuilder, defineFile } from '..';
import { resetFs, sleep, readDirSync, readFileSync } from './helper';

jest.mock('fs');

afterEach(() => {
  resetFs();
});

describe('fileBuilder build', () => {
  describe('build without dependencies, basic scene', () => {
    test('should create file and use getContent after build', async () => {
      const fileBuilder = getFileBuilder();
      const { addFile, build, getContent, close, onBuildStart, onBuildEnd } =
        fileBuilder;
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
      const onBuildStartHandler = jest.fn(() => {
        const files = readDirSync('/');
        expect(files).toEqual([]);
      });
      onBuildStart(onBuildStartHandler);
      const onBuildCompleteHandler = jest.fn();
      onBuildEnd(onBuildCompleteHandler);
      await build();
      expect(onBuildStartHandler).toBeCalledTimes(1);
      expect(onBuildCompleteHandler).toBeCalledTimes(1);
      const files = readDirSync('/');
      expect(files).toEqual(['a', 'b']);
      expect(readFileSync('/a')).toEqual('file a');
      expect(readFileSync('/b')).toEqual('file b');
      expect(getContent(a)).toEqual('file a');
      expect(getContent(b)).toEqual('file b');
      expect(getContent(v)).toEqual({ hello: 'world' });
      await close();
    });

    test('should run onBuildStart and onBuildEnd after build', async () => {
      const fileBuilder = getFileBuilder();
      const { build, close, onBuildStart, onBuildEnd } = fileBuilder;
      const onBuildStartHandler = jest.fn();
      onBuildStart(onBuildStartHandler);
      const onBuildCompleteHandler = jest.fn();
      onBuildEnd(onBuildCompleteHandler);
      await build();
      expect(onBuildStartHandler).toBeCalledTimes(1);
      expect(onBuildCompleteHandler).toBeCalledTimes(1);
      await close();
    });

    test('context should work', async () => {
      type Context = { hello: string };
      const context = { hello: 'world' };
      let c: any;
      const fileBuilder = getFileBuilder(context);
      const { addFile, build, getContent, close } = fileBuilder;
      const hello = defineFile<string, Context>({
        name: 'hello',
        content(context) {
          c = context;
          return context.hello;
        }
      });
      addFile(hello);
      await build();
      const files = readDirSync('/');
      expect(files).toEqual(['hello']);
      expect(readFileSync('/hello')).toEqual('world');
      expect(getContent(hello)).toEqual('world');
      expect(c).toBe(context);
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
      const files = readDirSync('/');
      expect(files).toEqual(['a', 'b']);
      await close();
      const newFiles = readDirSync('/');
      expect(newFiles.length).toEqual(0);
      expect(getContent(a)).toBeUndefined();
      expect(getContent(b)).toBeUndefined();
      expect(getContent(v)).toBeUndefined();
    });

    test('isDependency should work after build', async () => {
      const srcA = path.resolve('/', 'srcA');
      const srcB = path.resolve('/', 'srcB');
      const dirA = path.resolve('/', 'dirA');
      const dirB = path.resolve('/', 'dirB');
      const srcAA = path.resolve('/', 'dirA', 'A');
      const srcBB = path.resolve('/', 'dirB', 'B');
      const fileBuilder = getFileBuilder();
      const { addFile, build, close, isDependency } = fileBuilder;
      const a = defineFile({
        name: 'a',
        content() {
          return '';
        },
        dependencies: [srcA]
      });
      const b = defineFile({
        name: 'b',
        content() {
          return '';
        },
        dependencies: [dirA]
      });
      addFile(a, b);
      await build();
      expect(isDependency(srcA)).toBe(true);
      expect(isDependency(srcB)).toBe(false);
      expect(isDependency(dirA)).toBe(true);
      expect(isDependency(dirB)).toBe(false);
      expect(isDependency(srcAA)).toBe(true);
      expect(isDependency(srcBB)).toBe(false);
      expect(isDependency('noop')).toBe(false);
      await close();
    });
  });

  describe('build with dependencies', () => {
    test('should create files in the order of dependencies', async () => {
      const logs: string[] = [];
      const fileBuilder = getFileBuilder();
      const { addFile, build, onBuildEnd } = fileBuilder;
      const onBuildCompleteCallBack = jest.fn();
      onBuildEnd(onBuildCompleteCallBack);
      const A = defineFile({
        name: 'a',
        content() {
          logs.push('a start');
          logs.push('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          logs.push('b start');
          await sleep(200);
          logs.push('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          logs.push('c start');
          await sleep(100);
          logs.push('c end');
          return 'C';
        },
        dependencies: [B]
      });
      addFile(A, B, C);
      await build('/');
      const files = readDirSync('/');
      expect(files).toEqual(['a', 'b', 'c']);
      expect(readFileSync('/a')).toEqual('A');
      expect(readFileSync('/b')).toEqual('B');
      expect(readFileSync('/c')).toEqual('C');
      expect(logs).toEqual([
        'a start',
        'a end',
        'b start',
        'b end',
        'c start',
        'c end'
      ]);
      expect(onBuildCompleteCallBack).toBeCalledTimes(1);
    });

    test('should create files in parallel if a file has multiple dependents', async () => {
      const logs: string[] = [];
      const fileBuilder = getFileBuilder();
      const { addFile, build } = fileBuilder;
      const A = defineFile({
        name: 'a',
        content() {
          logs.push('a start');
          logs.push('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          logs.push('b start');
          await sleep(200);
          logs.push('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          logs.push('c start');
          await sleep(100);
          logs.push('c end');
          return 'C';
        },
        dependencies: [A]
      });
      addFile(A, B, C);
      await build('/');
      const files = readDirSync('/');
      expect(files).toEqual(['a', 'b', 'c']);
      expect(readFileSync('/a')).toEqual('A');
      expect(readFileSync('/b')).toEqual('B');
      expect(readFileSync('/c')).toEqual('C');
      expect(logs).toEqual([
        'a start',
        'a end',
        'b start',
        'c start',
        'c end',
        'b end'
      ]);
    });

    test('a file should not be created until all its dependencies are created', async () => {
      const logs: string[] = [];
      const fileBuilder = getFileBuilder();
      const { addFile, build } = fileBuilder;
      const A = defineFile({
        name: 'a',
        content() {
          logs.push('a start');
          logs.push('a end');
          return 'A';
        }
      });

      const B = defineFile({
        name: 'b',
        async content() {
          logs.push('b start');
          await sleep(200);
          logs.push('b end');
          return 'B';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        async content() {
          logs.push('c start');
          await sleep(100);
          logs.push('c end');
          return 'C';
        },
        dependencies: [A]
      });

      const D = defineFile({
        name: 'd',
        content() {
          logs.push('d start');
          logs.push('d end');
          return 'D';
        },
        dependencies: [B, C]
      });
      addFile(A, B, C, D);
      await build('/');
      const files = readDirSync('/');
      expect(files).toEqual(['a', 'b', 'c', 'd']);
      expect(readFileSync('/a')).toEqual('A');
      expect(readFileSync('/b')).toEqual('B');
      expect(readFileSync('/c')).toEqual('C');
      expect(readFileSync('/d')).toEqual('D');
      expect(logs).toEqual([
        'a start',
        'a end',
        'b start',
        'c start',
        'c end',
        'b end',
        'd start',
        'd end'
      ]);
    });
  });
});
