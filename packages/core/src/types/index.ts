import { Application } from "../application";

export interface Paths {
  projectDir: string;
  buildDir: string;

  // user src dir
  srcDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  pagesDir: string;
  // pageDocument: string;
  // tmpDir: string;
}

export interface AppModule {
  name: string;

  build(app: Application): Promise<void>;
}
