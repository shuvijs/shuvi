import { removeExt } from '../file';

describe('file', () => {
  test('removeExt should work', () => {
    expect(removeExt('')).toBe('');
    expect(removeExt('/a.js')).toBe('/a');
    expect(removeExt('/a.ts')).toBe('/a');
    expect(removeExt('/a.tsx')).toBe('/a');
    expect(removeExt('/a/b.js')).toBe('/a/b');
    expect(removeExt('/a.www.com/b.js')).toBe('/a.www.com/b');
    expect(removeExt('/a.www.com/b')).toBe('/a.www.com/b');
  });
});
