import { IShuviMode } from '../..';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { IRouteConfig } from '../runtime';
import { defineHook } from './helper';

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
  'bundler:config-target',
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

export type IHookBundlerExtraTarget = defineHook<
  'bundler:extra-target',
  {
    args: [
      {
        createConfig(options: any): any;
        mode: IShuviMode;
        webpack: typeof webpack;
      }
    ];
  }
>;

export type IEventTargetDone = defineHook<
  'bundler:target-done',
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

export type IEventBundlerDone = defineHook<
  'bundler:done',
  {
    args: [
      {
        first: boolean;
        stats: webpack.compilation.MultiStats;
      }
    ];
  }
>;

export type IEventServerListen = defineHook<
  'server:listen',
  {
    args: [
      {
        port: number;
        hostname: string;
      }
    ];
  }
>;

export type IHookDestory = defineHook<'destory'>;
