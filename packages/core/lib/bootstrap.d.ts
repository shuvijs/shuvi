import { Application } from "./application";
import { AppModule } from "./types";
import { ResourceSrc, TemplateContext } from "./resource";
declare type BootstrapTmplCtx = TemplateContext;
export declare class Bootstrap implements AppModule {
    name: string;
    private _templateContext;
    private _mainFile;
    setMainFile(src: ResourceSrc): void;
    setTemplateContext<K extends keyof BootstrapTmplCtx>(key: K, value: BootstrapTmplCtx[K]): void;
    build(app: Application): Promise<void>;
}
export {};
