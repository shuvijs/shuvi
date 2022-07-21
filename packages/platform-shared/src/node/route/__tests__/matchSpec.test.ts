import { matchFile as _matchFile, getFileMatcherPatterns } from '../matchSpec';

function matchFile(file: string, exclude: string[] = []) {
  const patterns = getFileMatcherPatterns('/', exclude);
  return _matchFile(file, patterns, false);
}

describe('routes/matchSpec', () => {
  test('should ignore node_modules', () => {
    expect(matchFile('/node_modules')).toBe(false);
    expect(matchFile('/path/to/node_modules')).toBe(false);
  });

  test('foo should ignore foo and all sub directories', () => {
    const test = (file: string) => matchFile(file, ['foo']);
    expect(test('/foo')).toBe(true);
    expect(test('/foo/')).toBe(false);
    expect(test('/foo/a')).toBe(false);
    expect(test('/foo/a/b')).toBe(false);
  });

  test('foo should ignore foo.js', () => {
    const test = (file: string) => matchFile(file, ['foo']);
    expect(test('/foo')).toBe(true);
    expect(test('/foo/')).toBe(false);
    expect(test('/foo/a')).toBe(false);
    expect(test('/foo/a/b')).toBe(false);
  });

  test('foo/* should ignore foo and all sub directories', () => {
    const test = (file: string) => matchFile(file, ['foo/*']);
    expect(test('/foo')).toBe(true);
    expect(test('/foo/')).toBe(false);
    expect(test('/foo/a')).toBe(false);
    expect(test('/foo/a/b')).toBe(false);
  });

  test('* should match a directory (dir)', () => {
    const test = (file: string) => matchFile(file, ['foo/*/bar']);
    expect(test('/foo/bar')).toBe(true);
    expect(test('/foo/bar/')).toBe(true);
    expect(test('/foo/a/bar')).toBe(true);
    expect(test('/foo/a/bar/')).toBe(false);
    expect(test('/foo/b/bar/')).toBe(false);
    expect(test('/foo/a/b/bar/')).toBe(true);
  });

  test('* should match a directory (file)', () => {
    const test = (file: string) => matchFile(file, ['foo/*/bar.js']);
    expect(test('/foo/bar.js')).toBe(true);
    expect(test('/foo/a/bar.js')).toBe(false);
    expect(test('/foo/b/bar.js')).toBe(false);
    expect(test('/foo/a/b/bar.js')).toBe(true);
  });

  test('** should match all sub directories (dir)', () => {
    const test = (file: string) => matchFile(file, ['foo/**/bar']);
    expect(test('/foo/zoo')).toBe(true);
    expect(test('/foo/bar/')).toBe(false);
    expect(test('/foo/a/bar/')).toBe(false);
    expect(test('/foo/a/b/bar/')).toBe(false);
  });

  test('** should match all sub directories (file)', () => {
    const test = (file: string) => matchFile(file, ['foo/**/bar.js']);
    expect(test('/foo/zoo')).toBe(true);
    expect(test('/foo/bar.js')).toBe(false);
    expect(test('/foo/a/bar.js')).toBe(false);
    expect(test('/foo/a/b/bar.js')).toBe(false);
  });
});
