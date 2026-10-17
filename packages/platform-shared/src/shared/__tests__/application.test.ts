import { ApplicationImpl } from '../application';
import { createRouter, createMemoryHistory } from '../router';
import { IPageRouteRecord } from '../routerTypes';

function getApp() {
  const app = new ApplicationImpl({
    config: {},
    AppComponent: {},
    getLoaders: () => Promise.resolve({}),
    router: createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          id: 'test',
          path: '/',
          component: ''
        } as IPageRouteRecord
      ]
    }).init()
  });
  return app;
}

describe('application', () => {
  test('should add init hook', async () => {
    const app = getApp();
    const fn = jest.fn();
    const {
      hooks: { init }
    } = app.pluginManager;
    init.use(fn);
    await app.init();
    expect(fn).toHaveBeenCalled();
  });

  test('should add createAppContext hook', async () => {
    const app = getApp();
    const {
      hooks: { appContext }
    } = app.pluginManager;
    appContext.use(context => {
      context.foo = 'bar';
    });
    await app.init();
    const ctx = app.context;
    expect(ctx.foo).toBe('bar');
  });

  test('should wrap appComponent hook', async () => {
    const app = getApp();
    const {
      hooks: { appContext, appComponent }
    } = app.pluginManager;
    appContext.use(context => {
      context.test = true;
    });
    appComponent.use((AppComponent: any, context: any) => {
      expect(context.test).toBe(true);
      const WrapApp = () => AppComponent;
      WrapApp.test = 'test';
      return WrapApp;
    });
    await app.init();

    expect(typeof app.appComponent).toBe('function');
    expect(app.appComponent.test).toBe('test');
  });

  test('should add dispose hook', async () => {
    const app = getApp();
    const fn = jest.fn();
    const {
      hooks: { dispose }
    } = app.pluginManager;
    dispose.use(fn);
    await app.init();
    await app.dispose();
    expect(fn).toHaveBeenCalled();
  });

  describe('yielding between plugin init and appContext', () => {
    afterEach(() => {
      delete (globalThis as any).window;
      delete (globalThis as any).scheduler;
      delete process.env.__SHUVI__HYDRATE_IN_TRANSITION__;
      jest.restoreAllMocks();
    });

    test('yields through MessageChannel on the client when hydrateInTransition is on', async () => {
      (globalThis as any).window = {};
      process.env.__SHUVI__HYDRATE_IN_TRANSITION__ = 'true';
      const RealChannel = (globalThis as any).MessageChannel;
      const channel = jest.fn(function () {
        return new RealChannel();
      });
      (globalThis as any).MessageChannel = channel;
      try {
        const timeout = jest.spyOn(globalThis, 'setTimeout');
        const app = getApp();
        const order: string[] = [];
        app.pluginManager.hooks.appContext.use(() => {
          order.push('appContext');
        });
        await app.init();
        expect(channel).toHaveBeenCalledTimes(1);
        expect(timeout).not.toHaveBeenCalled();
        expect(order).toEqual(['appContext']);
      } finally {
        (globalThis as any).MessageChannel = RealChannel;
      }
    });

    test('falls back to setTimeout when MessageChannel is unavailable', async () => {
      (globalThis as any).window = {};
      process.env.__SHUVI__HYDRATE_IN_TRANSITION__ = 'true';
      const original = (globalThis as any).MessageChannel;
      (globalThis as any).MessageChannel = undefined;
      try {
        const timeout = jest.spyOn(globalThis, 'setTimeout');
        const app = getApp();
        const order: string[] = [];
        app.pluginManager.hooks.appContext.use(() => {
          order.push('appContext');
        });
        await app.init();
        expect(timeout).toHaveBeenCalledWith(expect.any(Function), 0);
        expect(order).toEqual(['appContext']);
      } finally {
        (globalThis as any).MessageChannel = original;
      }
    });

    test('prefers scheduler.yield when it is available', async () => {
      (globalThis as any).window = {};
      process.env.__SHUVI__HYDRATE_IN_TRANSITION__ = 'true';
      const yieldFn = jest.fn(() => Promise.resolve());
      (globalThis as any).scheduler = { yield: yieldFn };
      const channel = jest.spyOn(globalThis as any, 'MessageChannel');
      const app = getApp();
      await app.init();
      expect(yieldFn).toHaveBeenCalledTimes(1);
      expect(channel).not.toHaveBeenCalled();
    });

    test('does not yield on the client when hydrateInTransition is off', async () => {
      (globalThis as any).window = {};
      const app = getApp();
      const order: string[] = [];
      app.pluginManager.hooks.init.use(() => {
        setTimeout(() => order.push('task'), 0);
      });
      app.pluginManager.hooks.appContext.use(() => {
        order.push('appContext');
      });
      await app.init();
      expect(order).toEqual(['appContext']);
    });

    test('does not yield on the server', async () => {
      const app = getApp();
      const order: string[] = [];
      app.pluginManager.hooks.init.use(() => {
        setTimeout(() => order.push('task'), 0);
      });
      app.pluginManager.hooks.appContext.use(() => {
        order.push('appContext');
      });
      await app.init();
      expect(order).toEqual(['appContext']);
    });
  });
});
