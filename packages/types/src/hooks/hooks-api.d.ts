import { IShuviMode, IApiConfig, Runtime } from '../..';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { IRouteConfig } from '../runtime';
import { defineHook } from './helper';

export type IHookGetConfig = defineHook<
  'getConfig',
  {
    initialValue: IApiConfig;
  }
>;

export type IHookAppRoutes = defineHook<
  'app:routes',
  {
    initialValue: IRouteConfig[];
  }
>;

export type IHookAppRoutesFile = defineHook<
  'app:routesFile',
  {
    initialValue: string;
  }
>;

export type IEventAppReady = defineHook<'app:ready'>;

export type IHookBundlerConfig = defineHook<
  'bundler:configTarget',
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
  'bundler:extraTarget',
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
  'bundler:targetDone',
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

export type IHookModifyHtmlProps = defineHook<
  'modifyHtml',
  {
    initialValue: Runtime.IDocumentProps;
    args: [object /* appContext */];
  }
>;

export type IHookDestory = defineHook<'destory'>;
