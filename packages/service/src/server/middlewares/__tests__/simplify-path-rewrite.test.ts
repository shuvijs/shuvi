import { simplifyPathRewrite, IProxyConfigItem } from '../httpProxyMiddleware';

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
