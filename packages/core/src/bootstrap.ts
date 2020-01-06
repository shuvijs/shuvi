import { Application } from "./application";
import { AppModule } from "./types";
import {
  ResourceSrc,
  createTemplateContext,
  TemplateContext,
  createTemplateResource
} from "./resource";

type BootstrapTmplCtx = TemplateContext;

export class Bootstrap implements AppModule {
  name = "boostrap";

  private _templateContext: BootstrapTmplCtx = createTemplateContext();

  private _mainFile = createTemplateResource({
    name: "bootstrap.js",
    context: this._templateContext,
    src: ""
  });

  setMainFile(src: ResourceSrc) {
    this._mainFile.src = src;
  }

  setTemplateContext<K extends keyof BootstrapTmplCtx>(
    key: K,
    value: BootstrapTmplCtx[K]
  ): void {
    this._templateContext.set(key, value);
  }

  async build(app: Application): Promise<void> {
    return app.buildResource('', this._mainFile);
  }
}
