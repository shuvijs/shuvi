import application from '../application';
import { createRouter, createMemoryHistory } from '../router';
import { getModelManager } from '../store';

function getApp({ render }: any = {}) {
  const app = application({
    loaders: {},
    loaderOptions: {},
    modelManager: getModelManager(),
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
    }).init(),
    async render(options) {
      return render && render(options);
    }
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
    await app.run();
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
    await app.run();
    const ctx = app.getContext();
    expect(ctx.foo).toBe('bar');
  });

  test('should wrap getAppComponent hook', async () => {
    const app = getApp();
    const {
      hooks: { getAppComponent }
    } = app.pluginManager;
    getAppComponent.use((AppComponent: any, context: any) => {
      const WrapApp = () => AppComponent;
      WrapApp.test = 'test';
      return WrapApp;
    });
    await app.run();

    expect(typeof app.AppComponent).toBe('function');
    expect(app.AppComponent.test).toBe('test');
  });

  test('should add dispose hook', async () => {
    const app = getApp();
    const fn = jest.fn();
    const {
      hooks: { dispose }
    } = app.pluginManager;
    dispose.use(fn);
    await app.run();
    await app.dispose();
    expect(fn).toHaveBeenCalled();
  });
});
