import { matchesSpecs as _matchesSpecs } from '../matchSpec';

function matchesSpecs({
  includes,
  excludes
}: { includes?: string[]; excludes?: string[] } = {}) {
  return _matchesSpecs('/', { includes, excludes, caseSensitive: false });
}

describe('routes/matchSpec', () => {
  describe('include', () => {
    test('should ignore node_modules and directories that start with a . character', () => {
      const test = matchesSpecs({ includes: ['**/*'] });
      expect(test('/node_modules')).toBe(true);
      expect(test('/node_modules/')).toBe(true);
      expect(test('/path/to/node_modules/')).toBe(true);
      expect(test('/path/to/.git')).toBe(true);
      expect(test('/path/to/.git/')).toBe(true);
    });

    test('should work with "*"', () => {
      const test = matchesSpecs({ includes: ['*.js'] });
      expect(test('/a.js')).toBe(false);
      expect(test('/a.ts')).toBe(true);
    });

    test('should work with "?"', () => {
      const test = matchesSpecs({ includes: ['a.?s'] });
      expect(test('/a.js')).toBe(false);
      expect(test('/a.ts')).toBe(false);
      expect(test('/a.jj')).toBe(true);
    });
  });

  describe('exclude', () => {
    test('foo should ignore foo and all sub directories', () => {
      // foo equals foo/*
      const test = matchesSpecs({ excludes: ['foo'] });
      expect(test('/foo')).toBe(false);
      expect(test('/foo/')).toBe(true);
      expect(test('/foo/a')).toBe(true);
      expect(test('/foo/a/b')).toBe(true);
    });

    test('foo should ignore foo.js', () => {
      const test = matchesSpecs({ excludes: ['foo.js'] });
      expect(test('/foo.js')).toBe(true);
      expect(test('/foo.js/')).toBe(true);
    });

    test('foo/* should ignore foo and all sub directories', () => {
      const test = matchesSpecs({ excludes: ['foo/*'] });
      expect(test('/foo')).toBe(false);
      expect(test('/foo/')).toBe(true);
      expect(test('/foo/a')).toBe(true);
      expect(test('/foo/a/b')).toBe(true);
    });

    test('* should match a directory (dir)', () => {
      const test = matchesSpecs({ excludes: ['foo/*/bar'] });
      expect(test('/foo/bar')).toBe(false);
      expect(test('/foo/bar/')).toBe(false);
      expect(test('/foo/a/bar')).toBe(false);
      expect(test('/foo/a/bar/')).toBe(true);
      expect(test('/foo/b/bar/')).toBe(true);
      expect(test('/foo/a/b/bar/')).toBe(false);
    });

    test('* should match a directory (file)', () => {
      const test = matchesSpecs({ excludes: ['foo/*/bar.js'] });
      expect(test('/foo/bar.js')).toBe(false);
      expect(test('/foo/a/bar.js')).toBe(true);
      expect(test('/foo/b/bar.js')).toBe(true);
      expect(test('/foo/a/b/bar.js')).toBe(false);
    });

    test('** should match all sub directories (dir)', () => {
      const test = matchesSpecs({ excludes: ['foo/**/bar'] });
      expect(test('/foo/zoo')).toBe(false);
      expect(test('/foo/bar/')).toBe(true);
      expect(test('/foo/a/bar/')).toBe(true);
      expect(test('/foo/a/b/bar/')).toBe(true);
    });

    test('** should match all sub directories (file)', () => {
      const test = matchesSpecs({ excludes: ['foo/**/bar.js'] });
      expect(test('/foo/zoo')).toBe(false);
      expect(test('/foo/bar.js')).toBe(true);
      expect(test('/foo/a/bar.js')).toBe(true);
      expect(test('/foo/a/b/bar.js')).toBe(true);
    });

    test('should takes precedence over include', () => {
      const test = matchesSpecs({ includes: ['foo'], excludes: ['**/bar.js'] });
      expect(test('/foo/bar')).toBe(false);
      expect(test('/foo/bar.js')).toBe(true);
    });
  });
});
