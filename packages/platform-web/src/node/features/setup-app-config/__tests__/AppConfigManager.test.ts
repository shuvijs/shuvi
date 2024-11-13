import { ShuviRequest } from '@shuvi/service/lib/server';
import AppConfigManager from '../AppConfigManager';

describe('AppConfigManager', () => {
  it('should get default appConfig when appConfig is not set for the request', () => {
    const context = {} as { req: ShuviRequest };
    context.req = {
      url: 'http://localhost:3000/test',
      _requestId: 'test'
    } as ShuviRequest;

    expect(AppConfigManager.getAppConfig(context.req!)).toStrictEqual({
      router: { basename: '' }
    });
  });

  it('should return appConfig when appConfig is set for the request', () => {
    const context = {} as { req?: ShuviRequest };
    context.req = {
      url: 'http://localhost:3000/test',
      _requestId: 'test'
    } as ShuviRequest;

    AppConfigManager.setAppConfig(context.req, {
      router: {
        basename: '/test'
      }
    });

    expect(AppConfigManager.getAppConfig(context.req)).toStrictEqual({
      router: {
        basename: '/test'
      }
    });
  });

  it('should only set appConfig once for the same request', () => {
    const context = {} as { req?: ShuviRequest };
    context.req = {
      url: 'http://localhost:3000/test',
      _requestId: 'test'
    } as ShuviRequest;

    AppConfigManager.setAppConfig(context.req, {
      router: {
        basename: '/test'
      }
    });

    AppConfigManager.setAppConfig(context.req, {
      router: {
        basename: '/test2'
      }
    });

    expect(AppConfigManager.getAppConfig(context.req)).toStrictEqual({
      router: {
        basename: '/test'
      }
    });
  });

  it(`WeaMap should be released after request is destroyed`, () => {
    const context = {} as { req: ShuviRequest };
    context.req = {
      url: 'http://localhost:3000/test',
      _requestId: 'test'
    } as ShuviRequest;

    AppConfigManager.setAppConfig(context.req, {
      router: {
        basename: '/test'
      }
    });

    expect(AppConfigManager.getAppConfig(context.req)).toStrictEqual({
      router: {
        basename: '/test'
      }
    });

    // create a new request reference
    context.req = {} as ShuviRequest;

    // return default appConfig
    expect(AppConfigManager.getAppConfig(context.req!)).toStrictEqual({
      router: { basename: '' }
    });
  });

  it(`should handle multiple requests`, () => {
    const context1 = {} as { req?: ShuviRequest };
    const context2 = {} as { req?: ShuviRequest };
    context1.req = {
      url: 'http://localhost:3000/test',
      _requestId: 'test'
    } as ShuviRequest;
    AppConfigManager.setAppConfig(context1.req, {
      router: {
        basename: '/test'
      }
    });

    context2.req = {
      url: 'http://localhost:3000/test2',
      _requestId: 'test2'
    } as ShuviRequest;
    AppConfigManager.setAppConfig(context2.req, {
      router: {
        basename: '/test2'
      }
    });

    expect(AppConfigManager.getAppConfig(context1.req)).toStrictEqual({
      router: {
        basename: '/test'
      }
    });
    expect(AppConfigManager.getAppConfig(context2.req)).toStrictEqual({
      router: {
        basename: '/test2'
      }
    });
  });
});
