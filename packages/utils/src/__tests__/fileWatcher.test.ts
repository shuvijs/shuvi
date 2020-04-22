import { watch } from '../fileWatcher';
import fs from 'fs';
import { resolveFixture, copyDirectory, deleteDirectory } from './utils';
import { wait } from 'shuvi-test-utils';

const prepare = () => {
  copyDirectory(resolveFixture('_watchers'), resolveFixture('watchers'));
};

const cleanUp = () => {
  deleteDirectory(resolveFixture('watchers'));
};

describe('fileWatcher', () => {
  beforeAll(() => {
    // copy fixtures/_watchers to fixtures/watchers
    prepare();
  });

  afterAll(() => {
    // delete fixtures/watchers
    cleanUp();
  });

  describe('watch file', () => {
    test('change a file', (done) => {
      const fileTarget = resolveFixture('watchers/watcher/watcher.js');

      let close = watch(
        {
          files: [fileTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(1);
          expect(changes[0]).toContain('watchers/watcher/watcher.js');
          expect(getAllFiles().length).toBe(1);
          expect(removals.length).toBe(0);
          close();
          done();
        }
      );

      fs.writeFileSync(fileTarget, `Trigger watcher`, 'utf-8');
    });

    test('add a file', (done) => {
      const fileTarget = resolveFixture('watchers/watcher-add/add.js');

      let close = watch(
        {
          files: [fileTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(1);
          expect(getAllFiles().length).toBe(2);
          expect(removals.length).toBe(0);
          close();
          done();
        }
      );

      fs.writeFileSync(fileTarget, '');
    });

    test('delete a file', async (done) => {
      const fileTarget = resolveFixture('watchers/watcher-delete/delete.js');

      let close = watch(
        {
          files: [fileTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(0);
          expect(getAllFiles().length).toBe(0);
          expect(removals.length).toBe(1);
          close();
          done();
        }
      );

      // Prevent race-condition
      await wait(500);

      fs.unlinkSync(fileTarget);
    });

    test('changing other file', async () => {
      const fileToChange = resolveFixture(
        'watchers/watcher-other-file/fileToChange.js'
      );
      const fileToWatch = resolveFixture(
        'watchers/watcher-other-file/fileToWatch.js'
      );

      const mock = jest.fn();
      let close = watch(
        {
          files: [fileToWatch],
        },
        mock
      );

      fs.writeFileSync(fileToChange, 'change file');
      await wait(1000);
      expect(mock).toBeCalledTimes(0);
      close();
    });
  });

  describe('watch directory', () => {
    test('change a file', (done) => {
      const directoryTarget = resolveFixture('watchers/watcher-directory');
      const fileTarget = resolveFixture('watchers/watcher-directory/file1.js');

      let close = watch(
        {
          directories: [directoryTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(1);
          expect(changes[0]).toContain('watcher-directory');
          expect(getAllFiles().length).toBe(3);
          expect(removals.length).toBe(0);
          close();
          done();
        }
      );

      fs.writeFileSync(fileTarget, `Trigger watcher`, 'utf-8');
    });

    test('add a file', (done) => {
      const directoryTarget = resolveFixture('watchers/watcher-directory-add');
      const fileTarget = resolveFixture(
        'watchers/watcher-directory-add/add.js'
      );

      let close = watch(
        {
          directories: [directoryTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(1);
          expect(changes[0]).toContain('watcher-directory');
          expect(getAllFiles().length).toBe(2);
          expect(removals.length).toBe(0);
          close();
          done();
        }
      );
      fs.writeFileSync(fileTarget, ``, 'utf-8');
    });

    /*
      Deleting a file in directory will not add to `removals` but only `changes`
      https://github.com/webpack/watchpack/blob/master/test/Watchpack.js#L245
    */
    test('delete a file', async (done) => {
      const directoryTarget = resolveFixture(
        'watchers/watcher-directory-remove'
      );
      const fileTarget = resolveFixture(
        'watchers/watcher-directory-remove/fileToRemove.js'
      );

      let close = watch(
        {
          directories: [directoryTarget],
        },
        ({ getAllFiles, changes, removals }) => {
          expect(changes.length).toBe(1);
          expect(changes[0]).toContain(
            '/fixtures/watchers/watcher-directory-remove'
          );
          expect(getAllFiles().length).toBe(0);
          expect(removals.length).toBe(0);
          close();
          done();
        }
      );
      await wait(500);
      fs.unlinkSync(fileTarget);
    });
  });
});
