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

  test('should keep protocol segment', () => {
    const result = joinPath('https://abc.com/', '/test');
    expect(result).toBe('https://abc.com/test');
  });
});
