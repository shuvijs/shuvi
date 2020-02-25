import { createApp } from "@shuvi/core";
import { AppCore, AppConfig, Paths, RouteConfig } from "@shuvi/core";
import eventEmitter from "@shuvi/utils/lib/eventEmitter";
import { joinPath } from "@shuvi/utils/lib/string";
import { RouterService as IRouterService } from "./types/routeService";
import RouterService from "./routerService";
import { runtime } from "./runtime";
import { DEV_PUBLIC_PATH } from "./constants";

export interface App {
  publicUrl: string;
  ssr: boolean;
  paths: Paths;
  watch(): void;
  build(): Promise<void>;
  on(event: "routes", listener: (routes: RouteConfig[]) => void): void;
  getClientIndex(): string;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  getPublicUrlPath(...paths: string[]): string;
}

const isDev = process.env.NODE_ENV === "development";

class AppImpl implements App {
  private _event = eventEmitter();
  private _app: AppCore;
  public _routerService: IRouterService;

  constructor({ config }: { config: AppConfig }) {
    this._app = createApp({
      config
    });
    this._routerService = new RouterService(this._app.paths.pagesDir);
  }

  get ssr() {
    return this._app.config.ssr;
  }

  get publicUrl() {
    return isDev ? DEV_PUBLIC_PATH : this._app.config.publicUrl;
  }

  get paths() {
    return this._app.paths;
  }

  // get config() {
  //   return this._app.config;
  // }

  async watch() {
    const { _app: app } = this;
    await runtime.install(app);
    await this._setupApp();

    this._routerService.subscribe(routes => {
      this._event.emit("routes", routes);
      app.setRoutesSource(runtime.generateRoutesSource(routes));
    });

    await this._app.build({});
  }

  async build() {
    const { _app: app, _routerService: routerService } = this;
    await runtime.install(app);
    await this._setupApp();

    const routes = await routerService.getRoutes();
    this._event.emit("routes", routes);
    app.setRoutesSource(runtime.generateRoutesSource(routes));

    await app.buildOnce({});
  }

  getClientIndex(): string {
    return require.resolve("@shuvi/runtime-core/lib/client/index");
  }

  resolveAppFile(...paths: string[]): string {
    return joinPath(this.paths.appDir, ...paths);
  }

  resolveUserFile(...paths: string[]): string {
    return joinPath(this.paths.srcDir, ...paths);
  }

  resolveBuildFile(...paths: string[]): string {
    return joinPath(this.paths.buildDir, ...paths);
  }

  getPublicUrlPath(buildPath: string): string {
    return joinPath(this.publicUrl, buildPath);
  }

  on(event: string, listener: (x: any) => void) {
    this._event.on(event, listener);
  }

  private async _setupApp() {
    // core files
    const { _app: app } = this;
    app.setBootstrapModule(runtime.getBootstrapFilePath());
    app.setAppModule(
      [this.resolveUserFile("app.js")],
      runtime.getAppFilePath()
    );
    app.setDocumentModule(
      [this.resolveUserFile("document.js")],
      runtime.getDocumentFilePath()
    );
  }
}

export function getApp(config: AppConfig): App {
  return new AppImpl({ config });
}
