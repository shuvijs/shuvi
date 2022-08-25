import { getFileBuilder, defineFile } from '..';
import {
  readFileSync,
  readDirSync,
  writeFileSync,
  resolveFixture,
  mkdirSync,
  rmdirSync,
  sleep
  // getRunner
} from './helper/index';

const prepare = () => {
  mkdirSync(resolveFixture('watch'));
};

const cleanUp = () => {
  rmdirSync(resolveFixture('watch'));
};

jest.setTimeout(10 * 1000); // 1 second

/**
 * fileWatcher has a aggregating timeout of 300 ms
 * fileBuilder's watcher has a aggregating timeout of 10 ms
 * We set build interval to 400 ms to make sure next build is independent.
 */
const BUILD_INTERVAL = 400;

describe('fileBuilder watch', () => {
  beforeEach(() => {
    // copy fixtures/_watchers to fixtures/watchers
    prepare();
  });

  afterEach(() => {
    // delete fixtures/watchers
    cleanUp();
  });
  const rootDir = resolveFixture('watch');

  const file = (name: string) => resolveFixture('watch', name);

  const matchFile = (matchArray: Array<[string, string]>) => {
    matchArray.forEach(([path, content]) => {
      expect(readFileSync(path)).toBe(content);
    });
  };

  const getRunner = (arr: (() => void)[], cb?: () => void) => {
    const functions = arr.map(fn => jest.fn(fn));
    return () => {
      const currentFunction = functions.shift();
      if (currentFunction) {
        currentFunction();
        cb?.();
        expect(currentFunction).toBeCalledTimes(1);
      }
    };
  };

  const src = file('src');
  const srcA = file('src-a');
  const srcB = file('src-b');
  const srcC = file('src-c');
  const srcD = file('src-d');
  const srcE = file('src-e');
  const a = file('a');
  const b = file('b');
  const c = file('c');
  const d = file('d');
  const e = file('e');
  const f = file('f');

  describe('watch with dependencies', () => {
    test('should update file by the order of dependencies after one updates', done => {
      const fileBuilder = getFileBuilder();

      const {
        addFile,
        getContent,
        watch,
        onBuildStart,
        onSingleBuildEnd,
        close
      } = fileBuilder;
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
          return getContent(A) + 'b';
        },
        dependencies: [A]
      });

      const C = defineFile({
        name: 'c',
        content() {
          return getContent(B) + 'c';
        },
        dependencies: [B]
      });
      addFile(A, B, C);
      watch(rootDir).then(() => {
        const checkCurrent = () => {
          const files = readDirSync(rootDir);
          expect(files).toEqual(['a', 'b', 'c', 'src']);
          matchFile([
            [a, 'a'],
            [b, 'ab'],
            [c, 'abc']
          ]);
        };
        checkCurrent();

        const onBuildStartHandler = jest.fn(() => {
          checkCurrent();
        });

        onBuildStart(onBuildStartHandler);

        onSingleBuildEnd(() => {
          expect(onBuildStartHandler).toBeCalledTimes(1);
          const newFiles = readDirSync(rootDir);
          expect(newFiles).toEqual(['a', 'b', 'c', 'src']);
          matchFile([
            [a, 'aa'],
            [b, 'aab'],
            [c, 'aabc']
          ]);
          close().then(done);
        });
        writeFileSync(src, 'aa');
      });
    });
  });

  describe('watch with dependencies and frequent updates', () => {
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
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcE, 'e');
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
            const result = readFileSync(srcC);
            await sleep(700);
            return result;
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
          matchFile([
            [a, 'a'],
            [b, 'ab'],
            [c, 'c'],
            [d, 'cd'],
            [e, 'e'],
            [f, 'ef']
          ]);
          const logs: string[] = [];
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcC, 'cc');
            setTimeout(() => {
              // At this time, there should be 2 running builds: A -> B and C -> D

              const start = () => {
                // buildStart event: E -> F should update
                // A and C should be still updating
                logs.push('start e');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'c'],
                  [d, 'cd'],
                  [e, 'e'],
                  [f, 'ef']
                ]);
              };
              const onBuildStartHandler = getRunner([start]);

              let onSingleBuildEndCanceler: () => void;

              const end1 = () => {
                // 1st buildEnd event: E -> F updated
                logs.push('end e');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'c'],
                  [d, 'cd'],
                  [e, 'ee'],
                  [f, 'eef']
                ]);
              };

              const end2 = () => {
                // 2nd buildEnd event: A -> B updated
                logs.push('end a');
                matchFile([
                  [a, 'aa'],
                  [b, 'aab'],
                  [c, 'c'],
                  [d, 'cd']
                ]);
              };

              const end3 = () => {
                // 3rd buildEnd event: C -> D updated
                logs.push('end c');
                matchFile([
                  [c, 'cc'],
                  [d, 'ccd']
                ]);
                expect(logs).toEqual(['start e', 'end e', 'end a', 'end c']);
                close().then(done);
              };
              const onSingleBuildEndHandler = getRunner(
                [end1, end2, end3],
                () => {
                  onSingleBuildEndCanceler();
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );
                }
              );
              onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );
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
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onBuildEnd,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcD, 'd');
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
            const result = readFileSync(srcC);
            await sleep(500);
            return result;
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
              const start = () => {
                // buildStart event: D -> E should update
                // At this time, C -> E should have been updated,
                // but A -> B should be still updating
                logs.push('start d');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'cc'],
                  [d, 'd'],
                  [e, 'ccd']
                ]);
              };

              const onBuildStartHandler = getRunner([start]);

              let onSingleBuildEndCanceler: () => void;

              const singleEnd1 = () => {
                // 1st buildEnd event: C -> E updated
                logs.push('end c');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'cc'],
                  [d, 'd'],
                  [e, 'ccd']
                ]);
              };

              const singleEnd2 = () => {
                // 2nd buildEnd event: D -> E updated
                logs.push('end d');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [d, 'dd'],
                  [e, 'ccdd']
                ]);
              };

              const singleEnd3 = () => {
                // 3rd buildEnd event: A -> B updated
                logs.push('end a');
                matchFile([
                  [a, 'aa'],
                  [b, 'aab']
                ]);
              };
              const onSingleBuildEndHandler = getRunner(
                [singleEnd1, singleEnd2, singleEnd3],
                () => {
                  onSingleBuildEndCanceler();
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );
                }
              );

              let onBuildEndCanceler: () => void;
              const end1 = () => {
                logs.push('end 1');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'cc'],
                  [d, 'dd'],
                  [e, 'ccdd']
                ]);
              };

              const end2 = () => {
                logs.push('end 2');
                matchFile([
                  [a, 'aa'],
                  [b, 'aab'],
                  [c, 'cc'],
                  [d, 'dd'],
                  [e, 'ccdd']
                ]);
                expect(logs).toEqual([
                  'end c',
                  'start d',
                  'end d',
                  'end 1',
                  'end a',
                  'end 2'
                ]);
                close().then(done);
              };

              const onBuildEndHandler = getRunner([end1, end2], () => {
                onBuildEndCanceler();
                onBuildEndCanceler = onBuildEnd(onBuildEndHandler);
              });

              onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );
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
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
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
          async content() {
            return readFileSync(srcB);
          },
          dependencies: [srcB]
        });
        const C = defineFile({
          name: 'c',
          async content() {
            const result = readFileSync(srcC);
            await sleep(1000);
            return result;
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

              const start = () => {
                // buildStart event: B -> D and B -> E should update
                // At this time, A -> D and C -> E should have been updated
                logs.push('start b');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'cc'],
                  [d, 'aab'],
                  [e, 'bcc']
                ]);
              };

              const onBuildStartHandler = getRunner([start]);

              let onSingleBuildEndCanceler: () => void;

              const end1 = () => {
                // 1st buildEnd event: A -> D updated
                logs.push('end a');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'c'],
                  [d, 'aab'],
                  [e, 'bc']
                ]);
              };

              const end2 = () => {
                // 2nd buildEnd event: C -> E updated
                logs.push('end c');
                matchFile([
                  [b, 'b'],
                  [c, 'cc'],
                  [e, 'bcc']
                ]);
              };

              const end3 = () => {
                // 3rd buildEnd event: B -> D and B -> E updated
                logs.push('end b');
                matchFile([
                  [b, 'bb'],
                  [d, 'aabb'],
                  [e, 'bbcc']
                ]);
                expect(logs).toEqual(['end a', 'end c', 'start b', 'end b']);
                close().then(done);
              };

              const onSingleBuildEndHandler = getRunner(
                [end1, end2, end3],
                () => {
                  onSingleBuildEndCanceler();
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );
                }
              );
              onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );
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
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
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
              let onSingleBuildEndCanceler: () => void;
              const logs: string[] = [];

              const start1 = () => {
                // 1st buildStart event: C -> D should update
                // At this time, A -> B should be still updating and there is one update waiting for it
                logs.push('start c');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'c'],
                  [d, 'cd']
                ]);
              };

              const start2 = () => {
                // 2nd buildStart event: A -> B which has been waiting should update
                // At this time, the former A -> B should updated
                logs.push('start a-2');
                matchFile([
                  [a, 'aa'],
                  [b, 'aab'],
                  [c, 'cc'],
                  [d, 'ccd']
                ]);
              };

              const onBuildStartHandler = getRunner([start1, start2], () => {
                onBuildStartCanceler();
                onBuildStartCanceler = onBuildStart(onBuildStartHandler);
              });

              const end1 = () => {
                // 1st buildEnd event: C -> D should have been updated
                logs.push('end c');
                matchFile([
                  [a, 'a'],
                  [b, 'ab'],
                  [c, 'cc'],
                  [d, 'ccd']
                ]);
              };

              const end2 = () => {
                // 2nd buildEnd event: A -> B should have been updated
                logs.push('end a-1');
                matchFile([
                  [a, 'aa'],
                  [b, 'aab'],
                  [c, 'cc'],
                  [d, 'ccd']
                ]);
              };

              const end3 = () => {
                // 3rd buildEnd event: A -> B should have been updated
                logs.push('end a-2');
                matchFile([
                  [a, 'aaa'],
                  [b, 'aaab'],
                  [c, 'cc'],
                  [d, 'ccd']
                ]);
                expect(logs).toEqual([
                  'start c',
                  'end c',
                  'end a-1',
                  'start a-2',
                  'end a-2'
                ]);
                close().then(done);
              };

              const onSingleBuildEndHandler = getRunner(
                [end1, end2, end3],
                () => {
                  onSingleBuildEndCanceler();
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );
                }
              );
              onBuildStartCanceler = onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );

              writeFileSync(srcC, 'cc');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });

      test('this new update should merge with the awaiting update if its pending files have intersection with both current build and the awaiting update', done => {
        /**
         * In this test case, file dependency graph is as the following
         * A -> D
         * B -> D
         * C -> D
         *
         * We will first trigger change of A. A -> D will update and is time consuming.
         * Then we will trigger change of B. B's dependency graph intersects with A's so it should wait for A's done.
         * Then, we will trigger change of C. C's dependency graph has intersection with A's and B's so it should merge with B.
         */
        const fileBuilder = getFileBuilder();
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
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
          async content() {
            const result = readFileSync(srcB);
            return result;
          },
          dependencies: [srcB]
        });

        const C = defineFile({
          name: 'c',
          async content() {
            const result = readFileSync(srcC);
            return result;
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          content() {
            return getContent(A) + getContent(B) + getContent(C);
          },
          dependencies: [A, B, C]
        });
        addFile(A, B, C, D);
        watch(rootDir).then(() => {
          writeFileSync(srcA, 'aa');
          setTimeout(() => {
            writeFileSync(srcB, 'bb');
            setTimeout(() => {
              let onSingleBuildEndCanceler: () => void;
              const logs: string[] = [];

              const start = () => {
                // buildStart event: C -> D should update and merge with B -> D
                logs.push('start bc');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'c'],
                  [d, 'aabc']
                ]);
              };

              const onBuildStartHandler = getRunner([start]);

              const end1 = () => {
                // 1st buildEnd event: A -> D should have been updated
                logs.push('end a');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'c'],
                  [d, 'aabc']
                ]);
              };

              const end2 = () => {
                // 2nd buildEnd event: B,C -> D should have been updated
                logs.push('end bc');
                matchFile([
                  [a, 'aa'],
                  [b, 'bb'],
                  [c, 'cc'],
                  [d, 'aabbcc']
                ]);
                expect(logs).toEqual(['end a', 'start bc', 'end bc']);
                close().then(done);
              };

              const onSingleBuildEndHandler = getRunner([end1, end2], () => {
                onSingleBuildEndCanceler();
                onSingleBuildEndCanceler = onSingleBuildEnd(
                  onSingleBuildEndHandler
                );
              });
              onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );
              writeFileSync(srcC, 'cc');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
      test('this new update should merge with the awaiting update if its pending files have intersection with the awaiting update but have no intersection with current build', done => {
        /**
         * In this test case, file dependency graph is as the following
         * A -> D
         * B -> D
         * B -> E
         * C -> E
         *
         * We will first trigger change of A. A -> D will update and is time consuming.
         * Then trigger change of B. B's dependency graph intersects with A's so it should wait for A's done.
         * At this time, trigger change of C. C's dependency graph has no intersection with A's but has intersection with B's so it should merge with B.
         */

        const fileBuilder = getFileBuilder();
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
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
          async content() {
            return readFileSync(srcB);
          },
          dependencies: [srcB]
        });
        const C = defineFile({
          name: 'c',
          async content() {
            const result = readFileSync(srcC);
            await sleep(1000);
            return result;
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
            writeFileSync(srcB, 'bb');

            setTimeout(() => {
              let onSingleBuildEndCanceler: () => void;
              const logs: string[] = [];
              const start = () => {
                // buildStart event: C -> E should update and merge with B -> [D, E]
                logs.push('start bc');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'c'],
                  [d, 'aab'],
                  [e, 'bc']
                ]);
              };
              const onBuildStartHandler = getRunner([start]);

              const end1 = () => {
                // 1st buildEnd event: A -> D should have been updated
                logs.push('end a');
                matchFile([
                  [a, 'aa'],
                  [b, 'b'],
                  [c, 'c'],
                  [d, 'aab'],
                  [e, 'bc']
                ]);
              };

              const end2 = () => {
                // 2nd buildEnd event: B and C should have been updated
                logs.push('end bc');
                matchFile([
                  [a, 'aa'],
                  [b, 'bb'],
                  [c, 'cc'],
                  [d, 'aabb'],
                  [e, 'bbcc']
                ]);
                expect(logs).toEqual(['end a', 'start bc', 'end bc']);
                close().then(done);
              };

              const onSingleBuildEndHandler = getRunner([end1, end2], () => {
                onSingleBuildEndCanceler();
                onSingleBuildEndCanceler = onSingleBuildEnd(
                  onSingleBuildEndHandler
                );
              });

              onBuildStart(onBuildStartHandler);
              onSingleBuildEndCanceler = onSingleBuildEnd(
                onSingleBuildEndHandler
              );
              writeFileSync(srcC, 'cc');
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
    });

    describe('if multiple current builds are still running and multiple updates are waiting for them separately, now another new update comes', () => {
      test('this new update should run immediately if its pending files have no intersection with all these build and updates', done => {
        /**
         * In this test case, there are three independent file dependency path
         * A -> B
         * C -> D
         * E -> F
         *
         * We will first trigger changes of A and C separately. Their updates will run immediately. Now there are two running builds.
         * Then we will trigger change of A and C separately again. These two changes will be waiting. Now there are two running builds and two waiting builds.
         * Then we will trigger change of E. E's dependency graph has no intersection with A's and C's so its update will run immediately.
         */

        const fileBuilder = getFileBuilder();
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcE, 'e');
        const A = defineFile({
          name: 'a',
          async content() {
            const result = readFileSync(srcA);
            await sleep(1800);
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
            const result = readFileSync(srcC);
            await sleep(1800);
            return result;
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
          // a-1 will run immediately
          writeFileSync(srcA, 'aa');

          setTimeout(() => {
            // c-1 will run immediately
            writeFileSync(srcC, 'cc');

            setTimeout(() => {
              // a-2 will wait for change of a-1
              writeFileSync(srcA, 'aaa');

              setTimeout(() => {
                // c-2 will wait for change of c-1
                writeFileSync(srcC, 'ccc');

                setTimeout(() => {
                  let onBuildStartCanceler: () => void;
                  let onSingleBuildEndCanceler: () => void;
                  const logs: string[] = [];

                  const start1 = () => {
                    logs.push('start e');
                    matchFile([
                      [a, 'a'],
                      [b, 'ab'],
                      [c, 'c'],
                      [d, 'cd'],
                      [e, 'e'],
                      [f, 'ef']
                    ]);
                  };

                  const start2 = () => {
                    logs.push('start a-2');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'c'],
                      [d, 'cd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const start3 = () => {
                    logs.push('start c-2');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'cc'],
                      [d, 'ccd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const end1 = () => {
                    logs.push('end e');
                    matchFile([
                      [a, 'a'],
                      [b, 'ab'],
                      [c, 'c'],
                      [d, 'cd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const end2 = () => {
                    logs.push('end a-1');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'c'],
                      [d, 'cd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const end3 = () => {
                    logs.push('end c-1');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'cc'],
                      [d, 'ccd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const end4 = () => {
                    logs.push('end a-2');
                    matchFile([
                      [a, 'aaa'],
                      [b, 'aaab'],
                      [c, 'cc'],
                      [d, 'ccd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                  };

                  const end5 = () => {
                    logs.push('end c-2');
                    matchFile([
                      [a, 'aaa'],
                      [b, 'aaab'],
                      [c, 'ccc'],
                      [d, 'cccd'],
                      [e, 'ee'],
                      [f, 'eef']
                    ]);
                    expect(logs).toEqual([
                      'start e',
                      'end e',
                      'end a-1',
                      'start a-2',
                      'end c-1',
                      'start c-2',
                      'end a-2',
                      'end c-2'
                    ]);
                    close().then(done);
                  };

                  const onBuildStartHandler = getRunner(
                    [start1, start2, start3],
                    () => {
                      onBuildStartCanceler();
                      onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                    }
                  );

                  const onSingleBuildEndHandler = getRunner(
                    [end1, end2, end3, end4, end5],
                    () => {
                      onSingleBuildEndCanceler();
                      onSingleBuildEndCanceler = onSingleBuildEnd(
                        onSingleBuildEndHandler
                      );
                    }
                  );

                  onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );

                  writeFileSync(srcE, 'ee');
                }, BUILD_INTERVAL);
              }, BUILD_INTERVAL);
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
      test('this new update should merge with the specific awaiting update if its pending files have intersection with one awaiting update', done => {
        /**
         * In this test case, file dependency graph is as the following
         * A -> B
         * C -> E
         * D -> E
         *
         * We will first trigger changes of A and C separately. Their updates will run immediately. Now there are two running builds.
         * Then we will trigger change of A and C separately again. These two changes will be waiting. Now there are two running builds and two waiting builds.
         *
         * Then trigger change of D. D's dependency graph intersects with C's so it should merge with C.
         */
        const fileBuilder = getFileBuilder();
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcC, 'c');
        writeFileSync(srcD, 'd');
        const A = defineFile({
          name: 'a',
          async content() {
            const result = readFileSync(srcA);
            await sleep(2000);
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
            const result = readFileSync(srcC);
            await sleep(1400);
            return result;
          },
          dependencies: [srcC]
        });
        const D = defineFile({
          name: 'd',
          async content() {
            const result = readFileSync(srcD);
            await sleep(100);
            return result;
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
          // a-1 will run immediately
          writeFileSync(srcA, 'aa');

          setTimeout(() => {
            // c-1 will run immediately
            writeFileSync(srcC, 'cc');

            setTimeout(() => {
              // a-2 will be waiting
              writeFileSync(srcA, 'aaa');

              setTimeout(() => {
                // c-2 will be waiting
                writeFileSync(srcC, 'ccc');

                setTimeout(() => {
                  let onBuildStartCanceler: () => void;
                  let onSingleBuildEndCanceler: () => void;
                  const logs: string[] = [];

                  const start1 = () => {
                    logs.push('start c-2');
                    matchFile([
                      [a, 'a'],
                      [b, 'ab'],
                      [c, 'cc'],
                      [d, 'd'],
                      [e, 'ccd']
                    ]);
                  };

                  const start2 = () => {
                    logs.push('start a-2');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'cc'],
                      [d, 'dd'],
                      [e, 'ccd']
                    ]);
                  };

                  const end1 = () => {
                    logs.push('end c-1');
                    matchFile([
                      [a, 'a'],
                      [b, 'ab'],
                      [c, 'cc'],
                      [d, 'd'],
                      [e, 'ccd']
                    ]);
                  };

                  const end2 = () => {
                    // time: 1900ms, d has been updated
                    logs.push('end a-1');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'cc'],
                      [d, 'dd'],
                      [e, 'ccd']
                    ]);
                  };

                  const end3 = () => {
                    logs.push('end c-2');
                    matchFile([
                      [a, 'aa'],
                      [b, 'aab'],
                      [c, 'ccc'],
                      [d, 'dd'],
                      [e, 'cccdd']
                    ]);
                  };

                  const end4 = () => {
                    logs.push('end a-2');
                    matchFile([
                      [a, 'aaa'],
                      [b, 'aaab'],
                      [c, 'ccc'],
                      [d, 'dd'],
                      [e, 'cccdd']
                    ]);
                    expect(logs).toEqual([
                      'end c-1',
                      'start c-2',
                      'end a-1',
                      'start a-2',
                      'end c-2',
                      'end a-2'
                    ]);
                    close().then(done);
                  };

                  const onBuildStartHandler = getRunner(
                    [start1, start2],
                    () => {
                      onBuildStartCanceler();
                      onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                    }
                  );

                  const onSingleBuildEndHandler = getRunner(
                    [end1, end2, end3, end4],
                    () => {
                      onSingleBuildEndCanceler();
                      onSingleBuildEndCanceler = onSingleBuildEnd(
                        onSingleBuildEndHandler
                      );
                    }
                  );

                  onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );

                  writeFileSync(srcD, 'dd');
                }, BUILD_INTERVAL);
              }, BUILD_INTERVAL);
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });

      test('this new update should merge with the multiple specific awaiting update if its pending files have intersection with one awaiting update', done => {
        /**
         * In this test case, file dependency graph is as the following
         * A -> D
         * B -> D
         * B -> E
         * C -> E
         *
         * We will first trigger changes of A and C separately. Their updates will run immediately. Now there are two running builds.
         * Then we will trigger change of A and C separately again. These two changes will be waiting. Now there are two running builds and two waiting builds.
         *
         * Then we will trigger change of B. B's dependency graph intersects with A's and C's so it should merge with both A and C.
         */
        const fileBuilder = getFileBuilder();
        const {
          addFile,
          getContent,
          watch,
          onBuildStart,
          onSingleBuildEnd,
          close
        } = fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');
        writeFileSync(srcC, 'c');
        const A = defineFile({
          name: 'a',
          async content() {
            const result = readFileSync(srcA);
            await sleep(1800);
            return result;
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
            const result = readFileSync(srcC);
            await sleep(1800);
            return result;
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
          // a-1 will run immediately
          writeFileSync(srcA, 'aa');

          setTimeout(() => {
            // c-1 will run immediately
            writeFileSync(srcC, 'cc');

            setTimeout(() => {
              // a-2 will be waiting
              writeFileSync(srcA, 'aaa');

              setTimeout(() => {
                // c-2 will be waiting
                writeFileSync(srcC, 'ccc');

                setTimeout(() => {
                  let onBuildStartCanceler: () => void;
                  let onSingleBuildEndCanceler: () => void;
                  const logs: string[] = [];

                  const start = () => {
                    logs.push('start abc');
                    matchFile([
                      [a, 'aa'],
                      [b, 'b'],
                      [c, 'cc'],
                      [d, 'aab'],
                      [e, 'bcc']
                    ]);
                  };

                  const end1 = () => {
                    logs.push('end a-1');
                    matchFile([
                      [a, 'aa'],
                      [b, 'b'],
                      [c, 'c'],
                      [d, 'aab'],
                      [e, 'bc']
                    ]);
                  };

                  const end2 = () => {
                    logs.push('end c-1');
                    matchFile([
                      [a, 'aa'],
                      [b, 'b'],
                      [c, 'cc'],
                      [d, 'aab'],
                      [e, 'bcc']
                    ]);
                  };

                  const end3 = () => {
                    logs.push('end abc');
                    matchFile([
                      [a, 'aaa'],
                      [b, 'bb'],
                      [c, 'ccc'],
                      [d, 'aaabb'],
                      [e, 'bbccc']
                    ]);
                    expect(logs).toEqual([
                      'end a-1',
                      'end c-1',
                      'start abc',
                      'end abc'
                    ]);
                    close().then(done);
                  };

                  const onBuildStartHandler = getRunner([start], () => {
                    onBuildStartCanceler();
                    onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                  });

                  const onSingleBuildEndHandler = getRunner(
                    [end1, end2, end3],
                    () => {
                      onSingleBuildEndCanceler();
                      onSingleBuildEndCanceler = onSingleBuildEnd(
                        onSingleBuildEndHandler
                      );
                    }
                  );

                  onBuildStartCanceler = onBuildStart(onBuildStartHandler);
                  onSingleBuildEndCanceler = onSingleBuildEnd(
                    onSingleBuildEndHandler
                  );

                  writeFileSync(srcB, 'bb');
                }, BUILD_INTERVAL);
              }, BUILD_INTERVAL);
            }, BUILD_INTERVAL);
          }, BUILD_INTERVAL);
        });
      });
    });
  });

  describe('watch with dependencies and skip build', () => {
    describe('during once build while watching', () => {
      test('a file should notify all its dependents that they can skip build if its content has no change', done => {
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onSingleBuildEnd, close } =
          fileBuilder;
        writeFileSync(src, 'a');

        const contentA = jest.fn((_, oldContent: string) => {
          if (oldContent) {
            return oldContent;
          }
          return readFileSync(src);
        });

        const contentB = jest.fn(() => {
          return getContent(A) + 'b';
        });

        const contentC = jest.fn(() => {
          return getContent(A) + 'c';
        });

        const A = defineFile({
          name: 'a',
          content: contentA,
          dependencies: [src]
        });

        const B = defineFile({
          name: 'b',
          content: contentB,
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          content: contentC,
          dependencies: [A]
        });
        addFile(A, B, C);
        watch(rootDir).then(() => {
          const check = () => {
            matchFile([
              [a, 'a'],
              [b, 'ab'],
              [c, 'ac']
            ]);
          };
          check();
          expect(contentA).toBeCalledTimes(1);
          expect(contentB).toBeCalledTimes(1);
          expect(contentC).toBeCalledTimes(1);
          onSingleBuildEnd(({ changedFiles }) => {
            expect(contentA).toBeCalledTimes(2);
            expect(contentB).toBeCalledTimes(1);
            expect(contentC).toBeCalledTimes(1);
            expect(changedFiles.size).toBe(0);
            check();
            close().then(done);
          });
          writeFileSync(src, 'aa');
        });
      });
      test('a file should notify its dependents that they can skip build if itself skip build', done => {
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onSingleBuildEnd, close } =
          fileBuilder;
        writeFileSync(src, 'a');

        const contentA = jest.fn(() => {
          return 'a';
        });

        const contentB = jest.fn(() => {
          return getContent(A) + 'b';
        });

        const contentC = jest.fn(() => {
          return getContent(B) + 'c';
        });

        const contentD = jest.fn(() => {
          return getContent(B) + 'd';
        });

        const A = defineFile({
          name: 'a',
          content: contentA,
          dependencies: [src]
        });

        const B = defineFile({
          name: 'b',
          content: contentB,
          dependencies: [A]
        });

        const C = defineFile({
          name: 'c',
          content: contentC,
          dependencies: [B]
        });
        const D = defineFile({
          name: 'd',
          content: contentD,
          dependencies: [B]
        });
        addFile(A, B, C, D);
        watch(rootDir).then(() => {
          const check = () => {
            matchFile([
              [a, 'a'],
              [b, 'ab'],
              [c, 'abc'],
              [d, 'abd']
            ]);
          };
          check();
          expect(contentA).toBeCalledTimes(1);
          expect(contentB).toBeCalledTimes(1);
          expect(contentC).toBeCalledTimes(1);
          expect(contentD).toBeCalledTimes(1);
          onSingleBuildEnd(({ changedFiles }) => {
            expect(contentA).toBeCalledTimes(2);
            expect(contentB).toBeCalledTimes(1);
            expect(contentC).toBeCalledTimes(1);
            expect(contentD).toBeCalledTimes(1);
            expect(changedFiles.size).toBe(0);
            check();
            close().then(done);
          });
          writeFileSync(src, 'aa');
        });
      });
      test('a file should skip build if all its dependencies notify it to skip build', done => {
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onSingleBuildEnd, close } =
          fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');

        const contentA = jest.fn(() => {
          return 'a';
        });

        const contentB = jest.fn(() => {
          return 'b';
        });

        const contentC = jest.fn(() => {
          return getContent(A) + getContent(B);
        });

        const A = defineFile({
          name: 'a',
          content: contentA,
          dependencies: [srcA]
        });

        const B = defineFile({
          name: 'b',
          content: contentB,
          dependencies: [srcB]
        });

        const C = defineFile({
          name: 'c',
          content: contentC,
          dependencies: [A, B]
        });
        addFile(A, B, C);
        watch(rootDir).then(() => {
          const check = () => {
            matchFile([
              [a, 'a'],
              [b, 'b'],
              [c, 'ab']
            ]);
          };
          check();
          expect(contentA).toBeCalledTimes(1);
          expect(contentB).toBeCalledTimes(1);
          expect(contentC).toBeCalledTimes(1);
          onSingleBuildEnd(({ changedFiles }) => {
            expect(contentA).toBeCalledTimes(2);
            expect(contentB).toBeCalledTimes(2);
            expect(contentC).toBeCalledTimes(1);
            expect(changedFiles.size).toBe(0);
            check();
            close().then(done);
          });
          writeFileSync(srcA, 'aa');
          writeFileSync(srcB, 'bb');
        });
      });
      test('a file should not skip build if not all its dependencies notify it to skip build', done => {
        const fileBuilder = getFileBuilder();
        const { addFile, getContent, watch, onSingleBuildEnd, close } =
          fileBuilder;
        writeFileSync(srcA, 'a');
        writeFileSync(srcB, 'b');

        const contentA = jest.fn(() => {
          return 'a';
        });

        const contentB = jest.fn(() => {
          return readFileSync(srcB);
        });

        const contentC = jest.fn(() => {
          return getContent(A) + getContent(B);
        });

        const A = defineFile({
          name: 'a',
          content: contentA,
          dependencies: [srcA]
        });

        const B = defineFile({
          name: 'b',
          content: contentB,
          dependencies: [srcB]
        });

        const C = defineFile({
          name: 'c',
          content: contentC,
          dependencies: [A, B]
        });
        addFile(A, B, C);
        watch(rootDir).then(() => {
          matchFile([
            [a, 'a'],
            [b, 'b'],
            [c, 'ab']
          ]);
          expect(contentA).toBeCalledTimes(1);
          expect(contentB).toBeCalledTimes(1);
          expect(contentC).toBeCalledTimes(1);
          onSingleBuildEnd(({ changedFiles }) => {
            matchFile([
              [a, 'a'],
              [b, 'bb'],
              [c, 'abb']
            ]);
            expect(changedFiles.size).toBeGreaterThan(0);
            expect(contentA).toBeCalledTimes(2);
            expect(contentB).toBeCalledTimes(2);
            expect(contentC).toBeCalledTimes(2);
            close().then(done);
          });
          writeFileSync(srcA, 'aa');
          writeFileSync(srcB, 'bb');
        });
      });
    });
  });
});
