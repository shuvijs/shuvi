import * as path from 'path';
import JsConfigPathsPlugin, {
  Pattern,
  hasZeroOrOneAsteriskCharacter,
  pathIsRelative,
  tryParsePattern,
  findBestPatternMatch,
  matchPatternOrExact,
  matchedText,
  patternText
} from '../jsconfig-paths-plugin';

// Helper function to test pattern matching since isPatternMatch is not exported
function isPatternMatch(
  { prefix, suffix }: Pattern,
  candidate: string
): boolean {
  return (
    candidate.length >= prefix.length + suffix.length &&
    candidate.startsWith(prefix) &&
    candidate.endsWith(suffix)
  );
}

describe('JsConfigPathsPlugin', () => {
  describe('Utility Functions', () => {
    describe('hasZeroOrOneAsteriskCharacter', () => {
      test('should return true for strings with no asterisk', () => {
        expect(hasZeroOrOneAsteriskCharacter('foo')).toBe(true);
        expect(hasZeroOrOneAsteriskCharacter('')).toBe(true);
        expect(hasZeroOrOneAsteriskCharacter('bar/baz')).toBe(true);
      });

      test('should return true for strings with one asterisk', () => {
        expect(hasZeroOrOneAsteriskCharacter('foo*')).toBe(true);
        expect(hasZeroOrOneAsteriskCharacter('*bar')).toBe(true);
        expect(hasZeroOrOneAsteriskCharacter('foo*bar')).toBe(true);
      });

      test('should return false for strings with multiple asterisks', () => {
        expect(hasZeroOrOneAsteriskCharacter('foo**')).toBe(false);
        expect(hasZeroOrOneAsteriskCharacter('**bar')).toBe(false);
        expect(hasZeroOrOneAsteriskCharacter('foo*bar*baz')).toBe(false);
      });
    });

    describe('pathIsRelative', () => {
      test('should return true for relative paths', () => {
        expect(pathIsRelative('./foo')).toBe(true);
        expect(pathIsRelative('../foo')).toBe(true);
        expect(pathIsRelative('./foo/bar')).toBe(true);
        expect(pathIsRelative('../foo/bar')).toBe(true);
      });

      test('should return false for absolute paths', () => {
        expect(pathIsRelative('/foo')).toBe(false);
        expect(pathIsRelative('C:\\foo')).toBe(false);
        expect(pathIsRelative('foo')).toBe(false);
        expect(pathIsRelative('@/foo')).toBe(false);
      });
    });

    describe('tryParsePattern', () => {
      test('should parse patterns with asterisk', () => {
        const result = tryParsePattern('foo*bar');
        expect(result).toEqual({
          prefix: 'foo',
          suffix: 'bar'
        });
      });

      test('should return undefined for patterns without asterisk', () => {
        expect(tryParsePattern('foobar')).toBeUndefined();
        expect(tryParsePattern('')).toBeUndefined();
      });

      test('should handle asterisk at start', () => {
        const result = tryParsePattern('*bar');
        expect(result).toEqual({
          prefix: '',
          suffix: 'bar'
        });
      });

      test('should handle asterisk at end', () => {
        const result = tryParsePattern('foo*');
        expect(result).toEqual({
          prefix: 'foo',
          suffix: ''
        });
      });
    });

    describe('isPatternMatch', () => {
      test('should match valid patterns', () => {
        const pattern: Pattern = { prefix: 'foo', suffix: 'bar' };
        expect(isPatternMatch(pattern, 'foobazbar')).toBe(true);
        expect(isPatternMatch(pattern, 'foobar')).toBe(true);
      });

      test('should not match invalid patterns', () => {
        const pattern: Pattern = { prefix: 'foo', suffix: 'bar' };
        expect(isPatternMatch(pattern, 'foobar')).toBe(true);
        expect(isPatternMatch(pattern, 'baz')).toBe(false);
        expect(isPatternMatch(pattern, 'foobaz')).toBe(false);
      });
    });

    describe('findBestPatternMatch', () => {
      test('should find the best match based on prefix length', () => {
        const patterns = [
          { prefix: 'foo', suffix: 'bar' },
          { prefix: 'foobaz', suffix: 'bar' },
          { prefix: 'fo', suffix: 'bar' }
        ];

        const result = findBestPatternMatch(patterns, p => p, 'foobazquxbar');

        expect(result).toEqual({ prefix: 'foobaz', suffix: 'bar' });
      });

      test('should return undefined when no match found', () => {
        const patterns = [{ prefix: 'foo', suffix: 'bar' }];

        const result = findBestPatternMatch(patterns, p => p, 'baz');

        expect(result).toBeUndefined();
      });
    });

    describe('matchPatternOrExact', () => {
      test('should return exact match when available', () => {
        const patterns = ['foo', 'bar', 'baz'];
        expect(matchPatternOrExact(patterns, 'foo')).toBe('foo');
      });

      test('should return pattern match when no exact match', () => {
        const patterns = ['foo*bar', 'baz*qux'];
        const result = matchPatternOrExact(patterns, 'foobazbar');
        expect(result).toEqual({ prefix: 'foo', suffix: 'bar' });
      });

      test('should return undefined when no match found', () => {
        const patterns = ['foo*bar'];
        expect(matchPatternOrExact(patterns, 'baz')).toBeUndefined();
      });
    });

    describe('matchedText', () => {
      test('should extract matched text from pattern', () => {
        const pattern: Pattern = { prefix: 'foo', suffix: 'bar' };
        expect(matchedText(pattern, 'foobazbar')).toBe('baz');
      });

      test('should handle empty matched text', () => {
        const pattern: Pattern = { prefix: 'foo', suffix: 'bar' };
        expect(matchedText(pattern, 'foobar')).toBe('');
      });
    });

    describe('patternText', () => {
      test('should reconstruct pattern string', () => {
        const pattern: Pattern = { prefix: 'foo', suffix: 'bar' };
        expect(patternText(pattern)).toBe('foo*bar');
      });
    });
  });

  describe('JsConfigPathsPlugin', () => {
    let plugin: JsConfigPathsPlugin;
    let mockResolver: any;
    let mockTarget: any;
    let mockHook: any;
    let callback: jest.Mock;

    beforeEach(() => {
      const paths = {
        '@/*': ['src/*'],
        'components/*': ['src/components/*'],
        utils: ['src/utils/index.ts'],
        'foo*bar': ['src/modules/*/index.ts']
      };

      plugin = new JsConfigPathsPlugin(paths, '/project/root');
      callback = jest.fn();

      mockTarget = {
        ensureHook: jest.fn().mockReturnValue('resolve-hook')
      };

      mockHook = {
        tapAsync: jest.fn()
      };

      mockResolver = {
        ensureHook: jest.fn().mockReturnValue(mockTarget),
        getHook: jest.fn().mockReturnValue(mockHook),
        doResolve: jest.fn()
      };
    });

    test('should apply plugin to resolver', () => {
      plugin.apply(mockResolver);

      expect(mockResolver.getHook).toHaveBeenCalledWith('described-resolve');
      expect(mockHook.tapAsync).toHaveBeenCalledWith(
        'JsConfigPathsPlugin',
        expect.any(Function)
      );
    });

    test('should handle empty paths configuration', () => {
      const emptyPlugin = new JsConfigPathsPlugin({}, '/project/root');
      emptyPlugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'some/module', path: '/project/root' };

      tapCallback(request, {}, callback);

      expect(callback).toHaveBeenCalledWith();
    });

    test('should skip node_modules', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = {
        request: 'some/module',
        path: '/project/root/node_modules/package'
      };

      tapCallback(request, {}, callback);

      expect(callback).toHaveBeenCalledWith();
    });

    test('should skip absolute paths', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: '/absolute/path', path: '/project/root' };

      tapCallback(request, {}, callback);

      expect(callback).toHaveBeenCalledWith();
    });

    test('should skip relative paths', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: './relative/path', path: '/project/root' };

      tapCallback(request, {}, callback);

      expect(callback).toHaveBeenCalledWith();
    });

    test('should resolve exact path mapping', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'utils', path: '/project/root' };

      mockResolver.doResolve.mockImplementation(
        (target: any, obj: any, message: any, context: any, cb: any) => {
          cb(null, { path: '/project/root/src/utils/index.ts' });
        }
      );

      tapCallback(request, {}, callback);

      expect(mockResolver.doResolve).toHaveBeenCalledWith(
        mockTarget,
        expect.objectContaining({
          request: path.join('/project/root', 'src/utils/index.ts')
        }),
        expect.stringContaining(
          'Aliased with tsconfig.json or jsconfig.json utils'
        ),
        {},
        expect.any(Function)
      );
    });

    test('should resolve wildcard path mapping', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: '@/components/Button', path: '/project/root' };

      mockResolver.doResolve.mockImplementation(
        (target: any, obj: any, message: any, context: any, cb: any) => {
          cb(null, { path: '/project/root/src/components/Button' });
        }
      );

      tapCallback(request, {}, callback);

      expect(mockResolver.doResolve).toHaveBeenCalledWith(
        mockTarget,
        expect.objectContaining({
          request: path.join('/project/root', 'src/components/Button')
        }),
        expect.stringContaining(
          'Aliased with tsconfig.json or jsconfig.json @/*'
        ),
        {},
        expect.any(Function)
      );
    });

    test('should skip .d.ts files', () => {
      const pathsWithDts = {
        'types/*': ['src/types/*.d.ts']
      };
      const dtsPlugin = new JsConfigPathsPlugin(pathsWithDts, '/project/root');
      dtsPlugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'types/example', path: '/project/root' };

      tapCallback(request, {}, callback);

      // Should not call doResolve for .d.ts files
      expect(mockResolver.doResolve).not.toHaveBeenCalled();
    });

    test('should handle resolver errors gracefully', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'utils', path: '/project/root' };

      mockResolver.doResolve.mockImplementation(
        (target: any, obj: any, message: any, context: any, cb: any) => {
          cb(new Error('Module not found'), undefined);
        }
      );

      tapCallback(request, {}, callback);

      // Should continue to next candidate or finish
      expect(mockResolver.doResolve).toHaveBeenCalled();
    });

    test('should try multiple path candidates', () => {
      const pathsWithMultiple = {
        utils: ['src/utils/index.ts', 'src/utils/index.js', 'utils/index.ts']
      };
      const multiPlugin = new JsConfigPathsPlugin(
        pathsWithMultiple,
        '/project/root'
      );
      multiPlugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'utils', path: '/project/root' };

      // First two candidates fail, third succeeds
      let callCount = 0;
      mockResolver.doResolve.mockImplementation(
        (target: any, obj: any, message: any, context: any, cb: any) => {
          callCount++;
          if (callCount < 3) {
            cb(new Error('Not found'), undefined);
          } else {
            cb(null, { path: '/project/root/utils/index.ts' });
          }
        }
      );

      tapCallback(request, {}, callback);

      expect(mockResolver.doResolve).toHaveBeenCalledTimes(3);
    });

    test('should handle complex wildcard patterns', () => {
      plugin.apply(mockResolver);

      const tapCallback = mockHook.tapAsync.mock.calls[0][1];
      const request = { request: 'foobazbar', path: '/project/root' };

      mockResolver.doResolve.mockImplementation(
        (target: any, obj: any, message: any, context: any, cb: any) => {
          cb(null, { path: '/project/root/src/modules/baz/index.ts' });
        }
      );

      tapCallback(request, {}, callback);

      expect(mockResolver.doResolve).toHaveBeenCalledWith(
        mockTarget,
        expect.objectContaining({
          request: path.join('/project/root', 'src/modules/baz/index.ts')
        }),
        expect.stringContaining(
          'Aliased with tsconfig.json or jsconfig.json foo*bar'
        ),
        {},
        expect.any(Function)
      );
    });
  });
});
