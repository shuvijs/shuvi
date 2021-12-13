import { IServerPluginInstance } from './serverHooks';

export interface IShuviServer {
  // rootDir: string;
  // publicDir: string;
  // buildDir: string;

  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
}

export interface ShuviServerOptions {
  rootDir: string;
  plugins?: IServerPluginInstance[];
}
