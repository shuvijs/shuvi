import { recursiveReadDir, recursiveReadDirSync } from '../recursiveReaddir';
import { vol } from 'memfs';

jest.mock('fs');

describe('recursiveReaddir', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        file01: 'file01',
        file02: 'file02',
        file03: 'file03',
      },
      './directoryLevel1'
    );

    vol.fromJSON(
      {
        file11: 'file11',
        file12: 'file12',
        file13: 'file13',
      },
      './directoryLevel1/directoryLevel2'
    );

    vol.fromJSON(
      {
        file21: 'file21',
        file22: 'file22',
        file23: 'file23',
      },
      './directoryLevel1/directoryLevel2/directoryLevel3'
    );
  });

  afterEach(() => {
    vol.reset();
  });

  test('should work', async () => {
    const result = await recursiveReadDir('./directoryLevel1');
    expect(result).toEqual([
      'directoryLevel1/directoryLevel2/directoryLevel3/file21',
      'directoryLevel1/directoryLevel2/directoryLevel3/file22',
      'directoryLevel1/directoryLevel2/directoryLevel3/file23',
      'directoryLevel1/directoryLevel2/file11',
      'directoryLevel1/directoryLevel2/file12',
      'directoryLevel1/directoryLevel2/file13',
      'directoryLevel1/file01',
      'directoryLevel1/file02',
      'directoryLevel1/file03',
    ]);
  });

  test('should throw error when no folder found', async () => {
    expect(recursiveReadDir('./notFound')).rejects.toThrowError(
      "ENOENT: no such file or directory, readdir './notFound'"
    );
  });
});

describe('recursiveReadDirSync', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        file01: 'file01',
        file02: 'file02',
        file03: 'file03',
      },
      './directoryLevel1'
    );

    vol.fromJSON(
      {
        file11: 'file11',
        file12: 'file12',
        file13: 'file13',
      },
      './directoryLevel1/directoryLevel2'
    );

    vol.fromJSON(
      {
        file21: 'file21',
        file22: 'file22',
        file23: 'file23',
      },
      './directoryLevel1/directoryLevel2/directoryLevel3'
    );
  });

  afterEach(() => {
    vol.reset();
  });

  test('should work', () => {
    const result = recursiveReadDirSync('./directoryLevel1');
    expect(result).toEqual([
      'directoryLevel1/directoryLevel2/directoryLevel3/file21',
      'directoryLevel1/directoryLevel2/directoryLevel3/file22',
      'directoryLevel1/directoryLevel2/directoryLevel3/file23',
      'directoryLevel1/directoryLevel2/file11',
      'directoryLevel1/directoryLevel2/file12',
      'directoryLevel1/directoryLevel2/file13',
      'directoryLevel1/file01',
      'directoryLevel1/file02',
      'directoryLevel1/file03',
    ]);
  });

  test('should throw error when no folder found', async () => {
    expect(() => recursiveReadDirSync('./notFound')).toThrowError(
      "ENOENT: no such file or directory, readdir './notFound'"
    );
  });
});
