import { Application } from '../application';
import { createRouter, createMemoryHistory } from '../router';
import { getStoreManager } from '../store';

function getApp() {
  const app = new Application({
    storeManager: getStoreManager(),
    AppComponent: {},
    router: createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          id: 'test',
          path: '/',
          component: ''
        }
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
      hooks: { getAppContext }
    } = app.pluginManager;
    getAppContext.use(context => {
      context.foo = 'bar';
      return context;
    });
    await app.init();
    const ctx = app.context;
    expect(ctx.foo).toBe('bar');
  });

  test('should wrap getAppComponent hook', async () => {
    const app = getApp();
    const {
      hooks: { getAppContext, getAppComponent }
    } = app.pluginManager;
    getAppContext.use(context => {
      context.test = true;
      return context;
    });
    getAppComponent.use((AppComponent: any, context: any) => {
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
});
