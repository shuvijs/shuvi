import { IServiceMode } from "@shuvi/core";
import webpack from "webpack";
import WebpackChain from "webpack-chain";
import { IRouteConfig } from "./runtime";

export interface IHookConfig {
  name: string;
  args: any[];
  initialValue: any;
}

type IDefaultConfig = {
  args: [];
  initialValue: void;
};

type defineHook<Name extends string, Config extends Partial<IHookConfig>> = {
  name: Name;
} & {
  [K in keyof Config]: Config[K];
} &
  {
    [K in Exclude<keyof IDefaultConfig, keyof Config>]: IDefaultConfig[K];
  };

export type IAppRoutes = defineHook<
  "app:routes",
  {
    initialValue: IRouteConfig[];
  }
>;

export type IAppRoutesFile = defineHook<
  "app:routes-file",
  {
    initialValue: string;
  }
>;

export type IBuildDone = defineHook<
  "build:done",
  {
    args: [
      {
        first: boolean;
        name: string;
        stats: webpack.Stats;
      }
    ];
  }
>;

export type IBundlerConfig = defineHook<
  "bundler:config",
  {
    initialValue: WebpackChain;
    args: [
      {
        name: string;
        mode: IServiceMode;
        webpack: typeof webpack;
      }
    ];
  }
>;
