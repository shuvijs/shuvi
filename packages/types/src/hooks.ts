import { IShuviMode } from '../';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { IRouteConfig } from './runtime';

export interface IHookConfig {
  name: string;
  args: any[];
  initialValue: any;
}

type IDefaultHookConfig = {
  args: [];
  initialValue: void;
};

type defineHook<
  Name extends string,
  Config extends Partial<IHookConfig> = {}
> = {
  name: Name;
} & {
  [K in keyof Config]: Config[K];
} &
  {
    [K in Exclude<
      keyof IDefaultHookConfig,
      keyof Config
    >]: IDefaultHookConfig[K];
  };

export type IHookAppRoutes = defineHook<
  'app:routes',
  {
    initialValue: IRouteConfig[];
  }
>;

export type IHookAppRoutesFile = defineHook<
  'app:routes-file',
  {
    initialValue: string;
  }
>;

export type IEventAppReady = defineHook<'app:ready'>;

export type IHookBundlerConfig = defineHook<
  'bundler:config',
  {
    initialValue: WebpackChain;
    args: [
      {
        name: string;
        mode: IShuviMode;
        webpack: typeof webpack;
      }
    ];
  }
>;

export type IEventBundlerDone = defineHook<
  'bundler:done',
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

export type IHookDestory = defineHook<'destory'>;
