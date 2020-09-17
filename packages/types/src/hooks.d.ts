import { defineHook } from '@shuvi/core';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { IApiConfig, IShuviMode } from '..';
import { IUserRouteConfig, IDocumentProps } from './runtime';
import { IWebpackHelpers } from './bundler';

export type IHookGetConfig = defineHook<
  'getConfig',
  {
    initialValue: IApiConfig;
  }
>;

export type IHookAppRoutes = defineHook<
  'app:routes',
  {
    initialValue: IUserRouteConfig[];
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
        helpers: IWebpackHelpers;
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

export type IHookModifyHtml = defineHook<
  'modifyHtml',
  {
    initialValue: IDocumentProps;
    args: [object /* appContext */];
  }
>;

export type IHookDestory = defineHook<'destory'>;

export type IEventAfterBuild = defineHook<'afterBuild'>;
