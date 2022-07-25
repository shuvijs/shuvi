import { getFileBuilder, defineFile } from '..';
import {
  readFileSync,
  readDirSync,
  writeFileSync,
  resolveFixture,
  mkdirSync,
  rmdirSync,
  sleep
} from './helper/index';
import { reactive } from '@vue/reactivity';

const prepare = () => {
  mkdirSync(resolveFixture('watch'));
};

const cleanUp = () => {
  rmdirSync(resolveFixture('watch'));
};

/**
 * fileWatcher has a aggregating timeout of 300 ms
 * fileBuilder's watcher has a aggregating timeout of 10 ms
 * We set build interval to 400 ms to make sure next build is independent.
 */
const BUILD_INTERVAL = 400;

describe('fileBuilder watch', () => {
  beforeAll(() => {
    // copy fixtures/_watchers to fixtures/watchers
    prepare();
  });

  afterAll(() => {
    // delete fixtures/watchers
    cleanUp();
  });
  const rootDir = resolveFixture('watch');
  const file = (name: string) => resolveFixture('watch', name);
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
          close().then(done);
        });
        writeFileSync(src, 'aa');
      });
    });

    test('if current build is still running, another update should wait for it', () => {});
  });

  describe('watch with dependencies and frequent updates', () => {
    describe('if current build is still running, another new update comes', () => {
      test('this new update should run immediately if its pending files have no intersection with current build', done => {
        /**
         * In this test case, there are two independent file dependency path
         * A -> B
         * C -> D
         *
         * We will first trigger changes of A. Its update will run immediately.
         * Then we will trigger change of C. C's dependency graph has no intersection with A's so its update will run immediately.
         */
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcC = file('src-c');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        const d = file('d');
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        const A = defineFile({
          name: 'a',
          async content() {
            await sleep(500);
            return readFileSync(srcA);
          },
          dependencies: [srcA]
        });

        const B = defineFile({
          name: 'b',
          content() {
            return getContent(A) + 'b';
          },
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          async content() {
            return readFileSync(srcC);
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          content() {
            return getContent(C) + 'd';
          },
          dependencies: [C]
        });
        addFile(A, B, C, D);
        watch(rootDir).then(() => {
          let onBuildStartCanceler: () => void;
          let onBuildEndCanceler: () => void;
          const logs: string[] = [];
          const onBuildStartHandler = jest.fn(() => {
            // 1st buildStart event: A and B should update
            logs.push('start a');
            expect(readFileSync(a)).toBe('a');
            expect(readFileSync(b)).toBe('ab');
            onBuildStartCanceler();
            onBuildStart(() => {
              // 2nd buildStart event: C and D should update
              // A and B should be still updating
              logs.push('start c');
              expect(readFileSync(a)).toBe('a');
              expect(readFileSync(b)).toBe('ab');
              expect(readFileSync(c)).toBe('c');
              expect(readFileSync(d)).toBe('cd');
            });
          });
          const onBuildEndHandler = jest.fn(() => {
            // 1st buildStart event: C and D should have been updated
            // but A and B should be still updating
            // because C and D are faster
            logs.push('end c');
            expect(readFileSync(c)).toBe('cc');
            expect(readFileSync(d)).toBe('ccd');
            expect(readFileSync(a)).toBe('a');
            expect(readFileSync(b)).toBe('ab');
            if (onBuildEndCanceler) {
              onBuildEndCanceler();
              onBuildEnd(() => {
                // 2nd buildEnd event: A and B should have been finally updated
                logs.push('end a');
                expect(readFileSync(a)).toBe('aa');
                expect(readFileSync(b)).toBe('aab');
                expect(onBuildStartHandler).toBeCalledTimes(1);
                expect(onBuildEndHandler).toBeCalledTimes(1);
                expect(logs).toEqual(['start a', 'start c', 'end c', 'end a']);
                close().then(done);
              });
            }
          });
          onBuildStartCanceler = onBuildStart(onBuildStartHandler);
          onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcC, 'cc');
          }, BUILD_INTERVAL);
        });
      });
      test('this new update should wait for current build if its pending files have intersection with current build', done => {
        /**
         * In this test case, there is one file dependency path
         * A -> C
         * B -> C
         *
         * We will first trigger changes of A. Its update will run immediately.
         * Then we will trigger change of B. B's dependency graph intersects with A's so it should wait for A's done.
         */
        const fileBuilder = getFileBuilder();

        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcB = file('src-b');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
        const A = defineFile({
          name: 'a',
          async content() {
            await sleep(500);
            return readFileSync(srcA);
          },
          dependencies: [srcA]
        });

        const B = defineFile({
          name: 'b',
          async content() {
            await sleep(200);
            return readFileSync(srcB);
          },
          dependencies: [srcB]
        });

        const C = defineFile({
          name: 'c',
          content() {
            return getContent(A) + getContent(B);
          },
          dependencies: [A, B]
        });
        addFile(A, B, C);
        watch(rootDir).then(() => {
          let onBuildStartCanceler: () => void;
          let onBuildEndCanceler: () => void;
          const logs: string[] = [];
          const onBuildStartHandler = jest.fn(() => {
            // 1st buildStart event: A and C should update
            logs.push('start a');
            expect(readFileSync(a)).toBe('a');
            expect(readFileSync(b)).toBe('b');
            expect(readFileSync(c)).toBe('ab');
            onBuildStartCanceler();
            onBuildStart(() => {
              // 2nd buildStart event: B and C should update
              logs.push('start b');
              expect(readFileSync(a)).toBe('aa');
              expect(readFileSync(c)).toBe('aab');
            });
          });
          const onBuildEndHandler = jest.fn(() => {
            // 1st buildEnd event: A and C should have been updated
            logs.push('end a');
            expect(readFileSync(a)).toBe('aa');
            expect(readFileSync(c)).toBe('aab');
            expect(readFileSync(b)).toBe('b');
            onBuildEndCanceler();
            onBuildEnd(() => {
              logs.push('end b');
              // 2nd buildEnd event: B and C should have been updated
              expect(readFileSync(b)).toBe('bb');
              expect(readFileSync(c)).toBe('aabb');
              expect(onBuildStartHandler).toBeCalledTimes(1);
              expect(onBuildEndHandler).toBeCalledTimes(1);
              expect(logs).toEqual(['start a', 'end a', 'start b', 'end b']);
              close().then(done);
            });
          });
          onBuildStartCanceler = onBuildStart(onBuildStartHandler);
          onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcB, 'bb');
          }, BUILD_INTERVAL);
        });
      });
    });
    describe('if multiple current builds are still running, another new update comes', () => {
      test('this new update should run immediately if its pending files have no intersection with all current builds', done => {
        /**
         * In this test case, there are three independent file dependency path
         * A -> B
         * C -> D
         * E -> F
         *
         * We will first trigger changes of A and C. Their updates will run immediately because their dependency graph has no intersection.
         * Then we will trigger change of E. E's dependency graph has no intersection with A's and C's so its update will run immediately as well.
         */
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcC = file('src-c');
        const srcE = file('src-e');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        const d = file('d');
        const e = file('e');
        const f = file('f');
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcE, 'e');
        const A = defineFile({
          name: 'a',
          async content() {
            await sleep(1000);
            return readFileSync(srcA);
          },
          dependencies: [srcA]
        });
        const B = defineFile({
          name: 'b',
          content() {
            return getContent(A) + 'b';
          },
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          async content() {
            await sleep(1000);
            return readFileSync(srcC);
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          content() {
            return getContent(C) + 'd';
          },
          dependencies: [C]
        });

        const E = defineFile({
          name: 'e',
          async content() {
            return readFileSync(srcE);
          },
          dependencies: [srcE]
        });

        const F = defineFile({
          name: 'f',
          content() {
            return getContent(E) + 'f';
          },
          dependencies: [E]
        });
        addFile(A, B, C, D, E, F);
        watch(rootDir).then(() => {
          expect(readFileSync(a)).toBe('a');
          expect(readFileSync(b)).toBe('ab');
          expect(readFileSync(c)).toBe('c');
          expect(readFileSync(d)).toBe('cd');
          expect(readFileSync(e)).toBe('e');
          expect(readFileSync(f)).toBe('ef');
          const logs: string[] = [];
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcC, 'cc');
            setTimeout(() => {
              // At this time, there should be 2 running builds: A -> B and C -> D
              const onBuildStartHandler = jest.fn(() => {
                // buildStart event: E -> F should update
                // A and C should be still updating
                logs.push('start e');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('c');
                expect(readFileSync(d)).toBe('cd');
                expect(readFileSync(e)).toBe('e');
                expect(readFileSync(f)).toBe('ef');
              });
              let onBuildEndCanceler: () => void;
              const onBuildEndHandler = jest.fn(() => {
                // 1st buildEnd event: E -> F updated
                logs.push('end e');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('c');
                expect(readFileSync(d)).toBe('cd');
                expect(readFileSync(e)).toBe('ee');
                expect(readFileSync(f)).toBe('eef');
                onBuildEndCanceler();
                onBuildEndCanceler = onBuildEnd(() => {
                  // 2nd buildEnd event: A -> B updated
                  logs.push('end a');
                  expect(readFileSync(a)).toBe('aa');
                  expect(readFileSync(b)).toBe('aab');
                  expect(readFileSync(c)).toBe('c');
                  expect(readFileSync(d)).toBe('cd');
                  onBuildEndCanceler();
                  onBuildEnd(() => {
                    // 3rd buildEnd event: C -> D updated
                    logs.push('end c');
                    expect(readFileSync(c)).toBe('cc');
                    expect(readFileSync(d)).toBe('ccd');
                    expect(logs).toEqual([
                      'start e',
                      'end e',
                      'end a',
                      'end c'
                    ]);
                    close().then(done);
                  });
                });
              });
              onBuildStart(onBuildStartHandler);
              onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
              writeFileSync(srcE, 'ee');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
      test('this new update should wait for specific build if its pending files have intersection with one current build', done => {
        /**
         * In this test case, there are two independent file dependency path: A -> B and [C, D] -> E
         * A -> B
         * C -> E
         * D -> E
         *
         * We will first trigger changes of A and C. Their updates will run immediately because their dependency graph has no intersection.
         * Then we will trigger change of D. D's dependency graph intersects with C's so it should wait for C's done.
         */
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcC = file('src-c');
        const srcD = file('src-d');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        const d = file('d');
        const e = file('e');
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcD, 'd');
        const A = defineFile({
          name: 'a',
          async content() {
            await sleep(1000);
            return readFileSync(srcA);
          },
          dependencies: [srcA]
        });
        const B = defineFile({
          name: 'b',
          content() {
            return getContent(A) + 'b';
          },
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          async content() {
            await sleep(500);
            return readFileSync(srcC);
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          async content() {
            return readFileSync(srcD);
          },
          dependencies: [srcD]
        });

        const E = defineFile({
          name: 'e',
          async content() {
            return getContent(C) + getContent(D);
          },
          dependencies: [C, D]
        });
        addFile(A, B, C, D, E);
        watch(rootDir).then(() => {
          const logs: string[] = [];
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcC, 'cc');
            setTimeout(() => {
              const onBuildStartHandler = jest.fn(() => {
                // buildStart event: D -> E should update
                // At this time, C -> E should have been updated,
                // but A -> B should be still updating
                logs.push('start d');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('cc');
                expect(readFileSync(d)).toBe('d');
                expect(readFileSync(e)).toBe('ccd');
              });
              let onBuildEndCanceler: () => void;
              const onBuildEndHandler = jest.fn(() => {
                // 1st buildEnd event: C -> E updated
                logs.push('end c');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('cc');
                expect(readFileSync(d)).toBe('d');
                expect(readFileSync(e)).toBe('ccd');

                onBuildEndCanceler();
                onBuildEndCanceler = onBuildEnd(() => {
                  // 2nd buildEnd event: D -> E updated
                  logs.push('end d');
                  expect(readFileSync(a)).toBe('a');
                  expect(readFileSync(b)).toBe('ab');
                  expect(readFileSync(d)).toBe('dd');
                  expect(readFileSync(e)).toBe('ccdd');

                  onBuildEndCanceler();
                  onBuildEnd(() => {
                    // 3rd buildEnd event: A -> B updated
                    logs.push('end a');
                    expect(readFileSync(a)).toBe('aa');
                    expect(readFileSync(b)).toBe('aab');
                    expect(logs).toEqual([
                      'end c',
                      'start d',
                      'end d',
                      'end a'
                    ]);
                    close().then(done);
                  });
                });
              });
              onBuildStart(onBuildStartHandler);
              onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
              writeFileSync(srcD, 'dd');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
      test('this new update should wait for multiple specific builds if its pending files have intersection with multiple current builds', done => {
        /**
         * In this test case, file dependency graph is as the following
         * A -> D
         * B -> D
         * B -> E
         * C -> E
         *
         * We will first trigger changes of A and C. Their updates will run immediately because their dependency graph has no intersection.
         * Then we will trigger change of B. B's dependency graph intersects with A's and C's so it should wait for them done.
         */
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcB = file('src-b');
        const srcC = file('src-c');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        const d = file('d');
        const e = file('e');
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
        writeFileSync(srcC, 'c');
        const A = defineFile({
          name: 'a',
          async content() {
            await sleep(1000);
            return readFileSync(srcA);
          },
          dependencies: [srcA]
        });
        const B = defineFile({
          name: 'b',
          async content() {
            return readFileSync(srcB);
          },
          dependencies: [srcB]
        });
        const C = defineFile({
          name: 'c',
          async content() {
            await sleep(1000);
            return readFileSync(srcC);
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          async content() {
            return getContent(A) + getContent(B);
          },
          dependencies: [A, B]
        });
        const E = defineFile({
          name: 'e',
          async content() {
            return getContent(B) + getContent(C);
          },
          dependencies: [B, C]
        });
        addFile(A, B, C, D, E);
        watch(rootDir).then(() => {
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcC, 'cc');
            setTimeout(() => {
              const logs: string[] = [];
              const onBuildStartHandler = jest.fn(() => {
                // buildStart event: B -> D and B -> E should update
                // At this time, A -> D and C -> E should have been updated
                logs.push('start b');
                expect(readFileSync(a)).toBe('aa');
                expect(readFileSync(b)).toBe('b');
                expect(readFileSync(c)).toBe('cc');
                expect(readFileSync(d)).toBe('aab');
                expect(readFileSync(e)).toBe('bcc');
              });
              let onBuildEndCanceler: () => void;
              const onBuildEndHandler = jest.fn(() => {
                // 1st buildEnd event: A -> D updated
                logs.push('end a');
                expect(readFileSync(a)).toBe('aa');
                expect(readFileSync(b)).toBe('b');
                expect(readFileSync(c)).toBe('c');
                expect(readFileSync(d)).toBe('aab');
                expect(readFileSync(e)).toBe('bc');

                onBuildEndCanceler();
                onBuildEndCanceler = onBuildEnd(() => {
                  // 2nd buildEnd event: C -> E updated
                  logs.push('end c');
                  expect(readFileSync(b)).toBe('b');
                  expect(readFileSync(c)).toBe('cc');
                  expect(readFileSync(e)).toBe('bcc');

                  onBuildEndCanceler();
                  onBuildEnd(() => {
                    // 3rd buildEnd event: B -> D and B -> E updated
                    logs.push('end b');
                    expect(readFileSync(b)).toBe('bb');
                    expect(readFileSync(d)).toBe('aabb');
                    expect(readFileSync(e)).toBe('bbcc');
                    expect(logs).toEqual([
                      'end a',
                      'end c',
                      'start b',
                      'end b'
                    ]);
                    close().then(done);
                  });
                });
              });
              onBuildStart(onBuildStartHandler);
              onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
              writeFileSync(srcB, 'bb');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
    });

    describe('if current build is still running and one update has been waiting for it, now another new update comes', () => {
      test('this new update should run immediately if its pending files have no intersection with current build and the awaiting update', done => {
        /**
         * In this test case, there are two independent file dependency path
         * A -> B
         * C -> D
         *
         * We will first trigger changes of A. Its update will run immediately but it is time consuming.
         * Then we will trigger another change of A. This update should wait for current running update.
         * And then we will trigger change of C. C's dependency graph has no intersection with A's so its update will run immediately.
         */
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onBuildStart, onBuildEnd, close } =
          fileBuilder;
        const srcA = file('src-a');
        const srcC = file('src-c');
        const a = file('a');
        const b = file('b');
        const c = file('c');
        const d = file('d');
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        const A = defineFile({
          name: 'a',
          async content() {
            const result = readFileSync(srcA);
            await sleep(1000);
            return result;
          },
          dependencies: [srcA]
        });

        const B = defineFile({
          name: 'b',
          content() {
            return getContent(A) + 'b';
          },
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          async content() {
            return readFileSync(srcC);
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          content() {
            return getContent(C) + 'd';
          },
          dependencies: [C]
        });
        addFile(A, B, C, D);
        watch(rootDir).then(() => {
          writeFileSync(srcA, 'aa');

          setTimeout(() => {
            writeFileSync(srcA, 'aaa');

            setTimeout(() => {
              let onBuildStartCanceler: () => void;
              let onBuildEndCanceler: () => void;
              const logs: string[] = [];
              const onBuildStartHandler = jest.fn(() => {
                // 1st buildStart event: C -> D should update
                // At this time, A -> B should be still updating and there is one update waiting for it
                logs.push('start c');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('c');
                expect(readFileSync(d)).toBe('cd');
                onBuildStartCanceler();
                onBuildStart(() => {
                  // 2nd buildStart event: A -> B which has been waiting should update
                  // At this time, the former A -> B should updated
                  logs.push('start a-2');
                  expect(readFileSync(a)).toBe('aa');
                  expect(readFileSync(b)).toBe('aab');
                  expect(readFileSync(c)).toBe('cc');
                  expect(readFileSync(d)).toBe('ccd');
                });
              });
              const onBuildEndHandler = jest.fn(() => {
                // 1st buildEnd event: C -> D should have been updated
                logs.push('end c');
                expect(readFileSync(a)).toBe('a');
                expect(readFileSync(b)).toBe('ab');
                expect(readFileSync(c)).toBe('cc');
                expect(readFileSync(d)).toBe('ccd');
                onBuildEndCanceler();
                onBuildEndCanceler = onBuildEnd(() => {
                  logs.push('end a-1');
                  // 2nd buildEnd event: A -> B should have been updated
                  expect(readFileSync(a)).toBe('aa');
                  expect(readFileSync(b)).toBe('aab');
                  expect(readFileSync(c)).toBe('cc');
                  expect(readFileSync(d)).toBe('ccd');
                  onBuildEndCanceler();
                  onBuildEnd(() => {
                    logs.push('end a-2');
                    // 2nd buildEnd event: A -> B should have been updated
                    expect(readFileSync(a)).toBe('aaa');
                    expect(readFileSync(b)).toBe('aaab');
                    expect(readFileSync(c)).toBe('cc');
                    expect(readFileSync(d)).toBe('ccd');
                    expect(logs).toEqual([
                      'start c',
                      'end c',
                      'end a-1',
                      'start a-2',
                      'end a-2'
                    ]);
                    close().then(done);
                  });
                });
              });
              onBuildStartCanceler = onBuildStart(onBuildStartHandler);
              onBuildEndCanceler = onBuildEnd(onBuildEndHandler);

              writeFileSync(srcC, 'cc');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });

      test.skip('this new update should merge with the awaiting update if its pending files have intersection with both current build and the awaiting update', () => {});
      test.skip('this new update should merge with the awaiting update if its pending files have intersection with the awaiting update but have no intersection with current build', () => {});
    });

    describe.skip('if multiple current builds is still running and multiple updates are waiting for them separately, now another new update comes', () => {
      test('this new update should run immediately if its pending files have no intersection with all these build and updates', () => {});
      test('this new update should merge with the specific awaiting update if its pending files have intersection with one awaiting update', () => {});

      test('this new update should merge with the multiple specific awaiting update if its pending files have intersection with one awaiting update', () => {});
    });
  });
});
