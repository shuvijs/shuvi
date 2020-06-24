import { Application } from '../application';

function getApp({ render }: any = {}) {
  const app = new Application({
    context: {},
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
});
