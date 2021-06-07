import { getFileManager, reactive } from '../index';
import { resetFs, recursiveReadDir, readFile } from './helper/fs';
import { waitForUpdate } from './helper/wait-for-update';

jest.mock('fs');

afterEach(resetFs);

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
