import React from 'react';
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
  module.hot.accept(['@shuvi/app/entry','@shuvi/app/core/app', '@shuvi/app/core/routes'],async ()=>{
    let AppComponent = require('@shuvi/app/core/app').default;
    let routes = require('@shuvi/app/core/routes').default;
    // to solve routing problem, we need to rerender routes
    // wait navigation complete only rerender to ensure getInitialProps is called
    if (__SHUVI.router._pending) {
      const removelistener = __SHUVI.router.afterEach(()=>{
        app.rerender({routes,AppComponent});
        removelistener()
      })
    } else {
      app.rerender({routes,AppComponent});
    }
  })
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
