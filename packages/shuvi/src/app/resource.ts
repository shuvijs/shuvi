import { App } from "@shuvi/types";
import fse from "fs-extra";
import path from "path";
import { parseTemplateFile } from "../renderer/view";
import {
  BUILD_CLIENT_DIR,
  BUILD_SERVER_DIR,
  BUILD_MANIFEST_PATH,
  BUILD_SERVER_APP
} from "../constants";

function resolveServerDist(app: App, name: string) {
  const manifest = app.resources.serverManifest;
  return path.join(app.paths.buildDir, BUILD_SERVER_DIR, manifest.chunks[name]);
}

function resolveDocument(app: App) {
  const customDoc = app.resolveUserFile("document.ejs");
  if (fse.existsSync(customDoc)) {
    return customDoc;
  }

  return require.resolve("@shuvi/runtime-core/template/document.ejs");
}

function initResource(app: App, name: string, initor: () => any) {
  const { resources, dev } = app;
  if (dev) {
    Object.defineProperty(resources, name, {
      get() {
        return initor();
      },
      enumerable: true,
      configurable: false
    });
  } else {
    resources[name] = initor();
  }
}

export function initBuiltInResources(app: App): void {
  const { paths } = app;
  initResource(app, "clientManifest", () =>
    require(path.join(paths.buildDir, BUILD_CLIENT_DIR, BUILD_MANIFEST_PATH))
  );
  initResource(app, "serverManifest", () =>
    require(path.join(paths.buildDir, BUILD_SERVER_DIR, BUILD_MANIFEST_PATH))
  );
  initResource(app, "app", () =>
    require(resolveServerDist(app, BUILD_SERVER_APP))
  );
  initResource(app, "documentTemplate", () =>
    parseTemplateFile(resolveDocument(app))
  );
}
