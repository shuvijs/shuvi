import { getFileBuilder, defineFile } from '../index';
import {
  readFileSync,
  readDirSync,
  writeFileSync,
  resolveFixture,
  copySync,
  emptyDirSync
} from './helper/index';
import { reactive } from '@vue/reactivity';

const prepare = () => {
  copySync(resolveFixture('_watch'), resolveFixture('watch'));
};

const cleanUp = () => {
  emptyDirSync(resolveFixture('watch'));
};

describe('fileBuilder watch', () => {
  beforeAll(() => {
    // copy fixtures/_watchers to fixtures/watchers
    prepare();
  });

  afterAll(() => {
    // delete fixtures/watchers
    cleanUp();
  });

  /** TODO: reactive support */
  describe.skip('watch with reactive', () => {
    test('should update file after changing state', done => {
      const fileBuilder = getFileBuilder();
      const { addFile, watch, getContent, close, onBuildEnd } = fileBuilder;
      const state = reactive({ content: 'a' });
      const test = defineFile({
        name: 'test',
        content() {
          return state.content;
        }
      });
      addFile(test);
      watch().then(() => {
        const files = readDirSync('/');
        expect(files).toEqual(['/test']);
        expect(readFileSync('/test')).toEqual('a');
        expect(getContent(test)).toEqual('a');
        onBuildEnd(() => {
          expect(readFileSync('/test')).toEqual('b');
          expect(getContent(test)).toEqual('b');
          close().then(() => {
            done();
          });
        });
        state.content = 'b';
      });
    });
  });

  describe('watch with dependencies', () => {
    test('should update file by the order of dependencies after one updates', done => {
      const fileBuilder = getFileBuilder();
      const rootDir = resolveFixture('watch');
      const file = (name: string) => resolveFixture('watch', name);
      const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
        fileBuilder;
      const src = file('src');
      const a = file('a');
      const b = file('b');
      const c = file('c');
      writeFileSync(src, 'a');
      const A = defineFile({
        name: 'a',
        content() {
          return readFileSync(src);
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
      watch(rootDir).then(() => {
        const checkCurrent = () => {
          const files = readDirSync(rootDir);
          expect(files).toEqual(['a', 'b', 'c', 'src']);
          expect(readFileSync(a)).toEqual('a');
          expect(readFileSync(b)).toEqual('a b');
          expect(readFileSync(c)).toEqual('a b c');
        };
        checkCurrent();

        const onBuildStartHandler = jest.fn(() => {
          checkCurrent();
        });

        onBuildStart(onBuildStartHandler);

        onBuildEnd(() => {
          expect(onBuildStartHandler).toBeCalledTimes(1);
          const newFiles = readDirSync(rootDir);
          expect(newFiles).toEqual(['a', 'b', 'c', 'src']);
          expect(readFileSync(a)).toEqual('aa');
          expect(readFileSync(b)).toEqual('aa b');
          expect(readFileSync(c)).toEqual('aa b c');
          close().then(() => {
            done();
          });
        });
        writeFileSync(src, 'aa');
      });
    });
  });
});
