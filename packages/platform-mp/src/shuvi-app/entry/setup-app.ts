// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { createClientApp } from '../application';

const app: ReturnType<typeof createClientApp> = createClientApp({
  async render({ AppComponent }) {
    view.renderApp({
      AppComponent: AppComponent
    });
  }
});

const rerender = () => {
  app.rerender();
};

export { app, rerender };
