import { joinPath } from '../string';

describe('joinPath', () => {
  test('should work', () => {
    const result = joinPath(
      'directory1',
      'inner',
      'inner/inner',
      '/remove',
      '//path//'
    );
    expect(result).toBe('directory1/inner/inner/inner/remove/path/');
  });
});
