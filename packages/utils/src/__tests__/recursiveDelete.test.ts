import { recursiveDelete } from '../recursiveDelete';
import { vol } from 'memfs';

jest.mock('fs');
describe('recursiveDelete', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        file1: 'file1',
        file2: 'file2',
      },
      './directoryToDelete'
    );
    vol.fromJSON(
      {
        innerFile1: 'innerFile',
        innerFile2: 'file2',
      },
      './directoryToDelete/innerLevel'
    );
  });

  afterEach(() => {
    vol.reset();
  });

  test('should work', async () => {
    const contentInPasteDirectoryBefore = vol.readdirSync(
      './directoryToDelete'
    );
    expect(contentInPasteDirectoryBefore.length).toBe(3);

    await recursiveDelete('./directoryToDelete');
    const contentInPasteDirectoryAfter = vol.readdirSync('./directoryToDelete');
    expect(contentInPasteDirectoryAfter.length).toBe(0);
    expect(vol.existsSync('./directoryToDelete')).toBe(true);
  });

  test('should not throw error when directory not found', async () => {
    await recursiveDelete('./fakeDirectory');
  });
});
