import React from 'react';
import { observer } from 'mobx-react';
import { File } from '@shuvi/react-fs';

function ApplicationFile() {
  const template = `
import App from "@shuvi/app/core/app";
import routes from "@shuvi/app/core/routes";
import { Application } from "@shuvi/runtime-core/lib/application";

export function create(context, options) {
  const app = new Application({
    AppComponent: App,
    routes,
    context,
    render: options.render
  });
  return app;
}
`;

  return <File name="application.js" content={template} />;
}

export default observer(ApplicationFile);
