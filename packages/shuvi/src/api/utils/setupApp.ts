import { Route, File } from "@shuvi/core";
import { runtime } from "../../runtime";
import { Api } from "../api";

export async function setupApp(api: Api) {
  runtime.install(api.getPluginApi());

  api.setBootstrapModule(runtime.getBootstrapModulePath());
  api.setAppModule(runtime.getAppModulePath());
  api.addFile(
    File.file("config.js", {
      content: [
        'import getConfig from "shuvi/lib/lib/runtime-config"',
        "export default getConfig",
        'export * from "shuvi/lib/lib/runtime-config"'
      ].join("\n")
    })
  );
  api.addFile(
    File.moduleCollection("server.js", {
      modules: {
        // TODO: extension support eg: jsx/ts/tsx
        app: [api.resolveUserFile("app.js"), runtime.getAppModulePath()],
        routes: api.resolveAppFile("routes"),
        document: [
          api.resolveUserFile("document.js"),
          require.resolve("@shuvi/runtime-core/lib/noop")
        ],
        renderer: runtime.getRendererModulePath()
      },
      defaultExports: ["routes", "renderer"]
    })
  );
  const route = new Route(api.paths.pagesDir);
  if (api.mode === "development") {
    route.subscribe(routes => {
      api.setRoutes(routes);
    });
  } else {
    const routes = await route.getRoutes();
    api.setRoutes(routes);
  }
}
