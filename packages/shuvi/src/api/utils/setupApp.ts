import { Route, File } from "@shuvi/core";
import { runtime } from "../../runtime";
import { Api } from "../api";

export async function setupApp(api: Api) {
  runtime.install(api.getPluginApi());

  api.setBootstrapModule(runtime.getBootstrapModulePath());
  api.setAppModule([api.resolveUserFile("app.js"), runtime.getAppModulePath()]);

  api.addAppExport(runtime.getAppModulePath(), "App");
  api.addAppExport(runtime.getRouterModulePath(), {
    imported: "default",
    local: "router"
  });
  api.addAppExport(api.resolveAppFile("core", "routes"), {
    imported: "default",
    local: "routes"
  });
  api.addAppExport("shuvi/lib/lib/runtime-config", [
    "setRuntimeConfig",
    {
      imported: "default",
      local: "getRuntimeConfig"
    }
  ]);

  api.addAppFile(
    File.moduleCollection("server.js", {
      modules: {
        app: api.resolveAppFile("core", "app"),
        routes: api.resolveAppFile("core", "routes"),
        // TODO: extension support eg: jsx/ts/tsx
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
