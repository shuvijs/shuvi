import { getFileManager } from '../fileManager';
import { resetFs, recursiveReadDir, readFile } from './utils';

jest.mock('fs');

afterEach(resetFs);

describe('watch: false', () => {
  const fileManager = getFileManager({ watch: false, rootDir: '/' });

  test('mount', async () => {
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
});
