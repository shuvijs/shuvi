const applicationJsFile = `import AppComponent from "@shuvi/app/core/app";
import pageRoutes from "@shuvi/app/core/pageRoutes";
import { getRoutes } from "@shuvi/app/core/platform";
import initPlugins from "@shuvi/app/user/plugin";
import { pluginRecord } from "@shuvi/app/core/plugins";
import { Application } from "@shuvi/core/lib/app/app-modules/application";
import runPlugins from "@shuvi/core/lib/app/app-modules/runPlugins";
import { createRouter, createMemoryHistory } from '@shuvi/router';

export function create(context, options) {
  const { req } = context;
  const history = createMemoryHistory({
    initialEntries: [req && req.url || '/'],
    initialIndex: 0
  })

  const router = createRouter({
    history,
    routes: getRoutes(pageRoutes, context)
  })
  const app = new Application({
    AppComponent,
    router,
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
`;

export default {
  content: () => applicationJsFile
};
