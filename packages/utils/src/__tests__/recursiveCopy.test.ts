import { recursiveCopy } from '../recursiveCopy';
import { vol } from 'memfs';

jest.mock('fs');
describe('recursiveCopy', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        file1: 'file1',
        file2: 'file2',
      },
      './directoryToCopy'
    );
    vol.fromJSON(
      {
        innerFile1: 'innerFile',
        innerFile2: 'file2',
      },
      './directoryToCopy/innerLevel'
    );

    vol.mkdirpSync('./directoryToPaste');
  });

  afterEach(() => {
    vol.reset();
  });

  test('should work', async () => {
    const contentInPasteDirectoryBefore = vol.readdirSync('./directoryToPaste');
    expect(contentInPasteDirectoryBefore.length).toBe(0);

    await recursiveCopy('./directoryToCopy', './directoryToPaste');
    const json = vol.toJSON();

    expect(Object.values(json).length).toBe(8);
    const contentInPasteDirectoryAfter = vol.readdirSync('./directoryToPaste');
    expect(contentInPasteDirectoryAfter.length).toBe(3);
    expect(vol.readFileSync('./directoryToPaste/file1', 'utf8')).toBe('file1');
    expect(vol.readFileSync('./directoryToPaste/file2', 'utf8')).toBe('file2');

    const contentInInnerDirectory = vol.readdirSync(
      './directoryToPaste/innerLevel'
    );

    expect(contentInInnerDirectory.length).toBe(2);
    expect(
      vol.readFileSync('./directoryToPaste/innerLevel/innerFile1', 'utf8')
    ).toBe('innerFile');
    expect(
      vol.readFileSync('./directoryToPaste/innerLevel/innerFile2', 'utf8')
    ).toBe('file2');
  });
});
