import { Application } from '../application';

function getApp({ render }: any = {}) {
  const app = new Application({
    context: {
      test: true
    },
    AppComponent: {},
    routes: [
      {
        id: 'test',
        component: ''
      }
    ],
    async render(options) {
      return render && render(options);
    }
  });
  return app;
}

describe('application', () => {
  test('should add createAppContext hook', async () => {
    const app = getApp();
    app.tap('createAppContext', {
      name: 'test',
      fn(context: any) {
        context.foo = 'bar';
        return context;
      }
    });
    await app.run();
    const ctx = app.getContext();
    expect(ctx.foo).toBe('bar');
  });

  test('should emit renderDone event', async () => {
    const render = jest.fn().mockReturnValue('render result');
    const app = getApp({ render });
    let renderResult;
    app.on('renderDone', (result: any) => {
      renderResult = result;
    });
    await app.run();
    expect(renderResult).toBe('render result');
    const renderPrarmas = render.mock.calls[0][0];
    expect(renderPrarmas['AppComponent']).toBeDefined();
    expect(renderPrarmas['routes']).toBeDefined();
    expect(renderPrarmas['appContext']).toBeDefined();
  });

  test('should wrap getAppComponent hook', async () => {
    const app = getApp();

    app.tap('getAppComponent', {
      name: 'wrapAppComponent',
      fn: (AppComponent: any, context: any) => {
        expect(context.test).toBe(true);

        const WrapApp = () => AppComponent;
        WrapApp.test = 'test';
        return WrapApp;
      }
    });

    await app.run();

    expect(typeof app.AppComponent).toBe('function');
    expect(app.AppComponent.test).toBe('test');
  });
});
