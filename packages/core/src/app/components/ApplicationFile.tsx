import { File } from '@shuvi/react-fs';

function ApplicationFile() {
  const app = `
import AppComponent from "@shuvi/app/core/app";
import routes from "@shuvi/app/core/routes";
import initPlugins from "@shuvi/app/core/plugin";
import { pluginRecord } from "@shuvi/app/core/plugins";
import { Application } from "@shuvi/core/lib/app/app-modules/application";
import runPlugins from "@shuvi/core/lib/app/app-modules/runPlugins";

const __CLIENT__ = typeof window !== 'undefined';

let app;

export function create(context, options) {
  // app is a singleton in client side
  if (__CLIENT__ && app) {
    return app;
  }

  app = new Application({
    AppComponent,
    routes,
    context,
    render: options.render
  });
  
  runPlugins({
    tap: app.tap.bind(app),
    initPlugins,
    pluginRecord,
  });

  return app;
}

if (module.hot) {
  let pending = null
  const rerender = () => {
    if (window.__DISABLE_HMR) {
      if (pending !== null) {
        clearTimeout(pending);
      }
      pending = setTimeout(() => {
        pending = null;
        rerender();
      }, 0)
      return;
    }

    let AppComponent = require('@shuvi/app/core/app').default;
    let routes = require('@shuvi/app/core/routes').default;
    app.rerender({routes,AppComponent});
  };
  module.hot.accept(['@shuvi/app/core/app', '@shuvi/app/core/routes'], () => {
    if (!app) return;
    rerender();
  });
}
`;

  const emptyApp = `
import { Application } from "@shuvi/core/lib/app/app-modules/application";

export function create(context, options) {
  return new Application({
    AppComponent: null,
    routes: [],
    context,
    render: options.render
  });
  return app;
}
`;

  return (
    <>
      <File name="application.js" content={app} />
      <File name="application-spa-server.js" content={emptyApp} />
    </>
  );
}

export default ApplicationFile;
