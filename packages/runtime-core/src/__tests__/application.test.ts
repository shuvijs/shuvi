import { Application, IContext } from '../application';
import { getAppStore } from '../appStore';
import { createRouter, createMemoryHistory } from '@shuvi/router';

function getApp({ render }: any = {}) {
  const app = new Application({
    context: {
      test: true
    } as unknown as IContext,
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
    }),
    appStore: getAppStore(),
    async render(options) {
      return render && render(options);
    }
  });
  return app;
}

describe('application', () => {
  test('should add createAppContext hook', async () => {
    const app = getApp();
    const {
      hooks: { context }
    } = app.pluginManager;
    context.use(context => {
      context.foo = 'bar';
      return context;
    });
    await app.run();
    const ctx = app.getContext();
    expect(ctx.foo).toBe('bar');
  });

  test('should emit renderDone event', async () => {
    const render = jest.fn().mockReturnValue('render result');
    const app = getApp({ render });
    let renderResult;
    const {
      hooks: { renderDone }
    } = app.pluginManager;
    renderDone.use(result => {
      renderResult = result;
    });
    await app.run();
    expect(renderResult).toBe('render result');
    const renderPrarmas = render.mock.calls[0][0];
    expect(renderPrarmas['AppComponent']).toBeDefined();
    expect(renderPrarmas['router']).toBeDefined();
    expect(renderPrarmas['appContext']).toBeDefined();
  });

  test('should wrap getAppComponent hook', async () => {
    const app = getApp();
    const {
      hooks: { appComponent }
    } = app.pluginManager;
    appComponent.use((AppComponent: any, context: any) => {
      expect(context.test).toBe(true);
      const WrapApp = () => AppComponent;
      WrapApp.test = 'test';
      return WrapApp;
    });
    await app.run();

    expect(typeof app.AppComponent).toBe('function');
    expect(app.AppComponent.test).toBe('test');
  });
});
