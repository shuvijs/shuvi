import { Route, File } from "@shuvi/core";
import { getTypeScriptInfo } from "@shuvi/utils/lib/detectTypescript";
import { runtime } from "../../runtime";
import { Api } from "../api";

function withExts(file: string, extensions: string[]): string[] {
  return extensions.map(ext => `${file}.${ext}`);
}

export async function setupApp(api: Api) {
  const { useTypeScript } = await getTypeScriptInfo(api.paths.rootDir);
  const moduleFileExtensions = useTypeScript
    ? ["tsx", "ts", "js", "jsx"]
    : ["js", "jsx", "tsx", "ts"];

  runtime.install(api.getPluginApi());

  api.setBootstrapModule(runtime.getBootstrapModulePath());
  api.setAppModule([
    ...withExts(api.resolveUserFile("app"), moduleFileExtensions),
    runtime.getAppModulePath()
  ]);

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
  api.addAppExport("@shuvi/runtime-core/lib/getAppData", ["getAppData"]);

  api.addAppFile(
    File.module("404.js", {
      source: [
        ...withExts(api.resolveUserFile("404"), moduleFileExtensions),
        runtime.get404ModulePath()
      ],
      defaultExport: true
    }),
    "pages"
  );
  api.addAppFile(
    File.moduleCollection("server.js", {
      modules: {
        app: api.resolveAppFile("core", "app"),
        routes: api.resolveAppFile("core", "routes"),
        document: [
          ...withExts(api.resolveUserFile("document"), moduleFileExtensions),
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
