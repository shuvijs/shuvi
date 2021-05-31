import { reactive } from '@vue/reactivity';
import { getFileManager } from '../fileManager';
import { resetFs, recursiveReadDir, readFile } from './helper/fs';
import { waitForUpdate } from './helper/wait-for-update';

jest.mock('fs');

afterEach(resetFs);

test('should create file after mount', async () => {
  const fileManager = getFileManager({ watch: false, rootDir: '/' });
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
  await fileManager.mount();
  const files = await recursiveReadDir('/');
  expect(files).toEqual(['a', 'b']);
  expect(await readFile('/a')).toEqual('file a');
  expect(await readFile('/b')).toEqual('file b');
});

test('should update file after changing state', async () => {
  const fileManager = getFileManager({ watch: true, rootDir: '/' });
  const state = reactive({
    content: 'a'
  });
  fileManager.addFile({
    name: 'test',
    content() {
      return state.content;
    }
  });
  await fileManager.mount();
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
  const fileManager = getFileManager({ watch: false, rootDir: '/' });
  const state = reactive({
    content: 'a'
  });
  fileManager.addFile({
    name: 'test',
    content() {
      return state.content;
    }
  });
  await fileManager.mount();
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
  const fileManager = getFileManager({ watch: false, rootDir: '/' });
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
  await fileManager.mount();
  const files = await recursiveReadDir('/');
  expect(files).toEqual(['a', 'b']);
  expect(true).toBe(true);

  await fileManager.unmount();
  const newFiles = await recursiveReadDir('/');
  expect(newFiles.length).toEqual(0);
});
