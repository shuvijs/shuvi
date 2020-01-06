import { Application } from "../application";
export interface Paths {
    projectDir: string;
    buildDir: string;
    srcDir: string;
    appDir: string;
    pagesDir: string;
}
export interface AppModule {
    name: string;
    build(app: Application): Promise<void>;
}
