import React from 'react';
import { File } from '@shuvi/react-fs';

function ApplicationFile() {
  const app = `
import AppComponent from "@shuvi/app/core/app";
import routes from "@shuvi/app/core/routes";
import { Application } from "@shuvi/core/lib/app/lib/application";
import pluginsHash from "@shuvi/app/core/pluginsHash";
import runPlugins from "@shuvi/core/lib/app/lib/runPlugins";

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
  
  runPlugins(app.tap.bind(app));

  return app;
}

if (module.hot) {
  module.hot.accept(['@shuvi/app/core/app', '@shuvi/app/core/routes'], () => {
    if (!app) return;

    let AppComponent = require('@shuvi/app/core/app').default;
    let routes = require('@shuvi/app/core/routes').default;
    app.rerender({routes,AppComponent});
  });
}
`;

  const emptyApp = `
import { Application } from "@shuvi/runtime-core/lib/lib/application";

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
