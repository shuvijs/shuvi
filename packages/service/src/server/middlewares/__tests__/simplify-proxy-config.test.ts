import {
  simplifyPathRewrite,
  IProxyConfigItem,
  transformContextFilter
} from '../httpProxyMiddleware';

describe('Simplify proxy config test', function () {
  describe('Simplify path rewrite test', function () {
    it('should get origin object when lose target and context', function () {
      const item: IProxyConfigItem = {};
      expect(simplifyPathRewrite(item)).toBe(item);
    });

    it('should get origin object when lose target', function () {
      const item: IProxyConfigItem = {
        context: '/api'
      };
      expect(simplifyPathRewrite(item)).toBe(item);
    });

    it('should get origin object when lose context', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost'
      };
      expect(simplifyPathRewrite(item)).toBe(item);
    });

    it('should get origin object when target and context not end with /*', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost',
        context: '/api'
      };
      expect(simplifyPathRewrite(item)).toBe(item);
    });

    it('should generated path rewrite when both end with /*', function () {
      const item: IProxyConfigItem = {
        target: 'http://localhost/console/*',
        context: '/api/*'
      };
      const result = simplifyPathRewrite(item);
      expect(result).toEqual({
        target: 'http://localhost/console',
        context: '/api',
        pathRewrite: { '^/api': '' }
      });
    });
  });

  describe('Transform context filter test ', function () {
    it('should get origin object when has pathRewrite', () => {
      const item: IProxyConfigItem = {
        pathRewrite: {}
      };
      expect(transformContextFilter(item)).toBe(item);
    });

    it('should get origin object when has pathRewrite', () => {
      const item: IProxyConfigItem = {
        context: '/api',
        target: 'http://example.com/api'
      };
      const result = transformContextFilter(item);
      const ctx = result.context as (pathname: string) => boolean;
      const withoutSalahResult = ctx('/api');
      const withSalahResult = ctx('/api/');
      const wrongPathnameResult = ctx('/api/');

      expect(
        withoutSalahResult && withSalahResult && !wrongPathnameResult
      ).toBe(false);
    });
  });
});
