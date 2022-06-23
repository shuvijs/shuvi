// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { createApp } from '../application';

const app = createApp();

const render = () => {
  view.renderApp({
    AppComponent: app.getPublicAPI().appComponent
  });
};

export { app, render };
