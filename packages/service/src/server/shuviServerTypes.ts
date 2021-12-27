import { IServerPluginInstance } from './plugin';

export interface IShuviServer {
  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
}

export interface ShuviServerOptions {
  rootDir: string;
  plugins?: IServerPluginInstance[];
}
