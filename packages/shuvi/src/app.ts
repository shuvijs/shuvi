import { appShell, AppShell, FileType } from "@shuvi/app-shell";
import { App, Paths } from "@shuvi/types";
import eventEmitter from "@shuvi/utils/lib/eventEmitter";
import { joinPath } from "@shuvi/utils/lib/string";
import { getPaths } from "./paths";
import RouterService from "./routerService";
import { runtime } from "./runtime";
import { AppConfig } from "./config";
import { DEV_PUBLIC_PATH } from "./constants";

const isDev = process.env.NODE_ENV === "development";

class AppImpl implements App<FileType> {
  public paths: Paths;

  private _config: AppConfig;
  private _appShell: AppShell;
  private _routerService: RouterService;
  private _event = eventEmitter();

  constructor({ config }: { config: AppConfig }) {
    this._config = config;
    this._appShell = appShell();
    this.paths = getPaths({
      cwd: config.cwd,
      outputPath: config.outputPath
    });
    this._routerService = new RouterService(this.paths.pagesDir);
  }

  get ssr() {
    return this._config.ssr;
  }

  get router() {
    const config = this._config;
    let { history } = config.router;
    if (history === "auto") {
      history = this.ssr ? "browser" : "hash";
    }

    return {
      history
    };
  }

  get publicUrl() {
    return isDev ? DEV_PUBLIC_PATH : this._config.publicUrl;
  }

  addFile(file: FileType) {
    this._appShell.addFile(file);
  }

  async watch() {
    const { _appShell: appShell } = this;
    await runtime.install(this);
    await this._setupApp();

    this._routerService.subscribe(routes => {
      this._event.emit("routes", routes);
      appShell.setRoutesSource(runtime.generateRoutesSource(routes));
    });

    await appShell.build({
      dir: this.paths.appDir
    });
  }

  async build() {
    const { _appShell: appShell, _routerService: routerService } = this;
    await runtime.install(this);
    await this._setupApp();

    const routes = await routerService.getRoutes();
    this._event.emit("routes", routes);
    appShell.setRoutesSource(runtime.generateRoutesSource(routes));

    await appShell.buildOnce({
      dir: this.paths.appDir
    });
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
    const { _appShell: appShell } = this;
    appShell.setBootstrapModule(runtime.getBootstrapFilePath());
    appShell.setAppModule(
      [this.resolveUserFile("app.js")],
      runtime.getAppFilePath()
    );
    appShell.setDocumentModule(
      [this.resolveUserFile("document.js")],
      runtime.getDocumentFilePath()
    );
  }
}

export function getApp(config: AppConfig): App<FileType> {
  return new AppImpl({ config });
}
