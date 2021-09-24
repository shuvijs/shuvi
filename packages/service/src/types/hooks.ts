import { IncomingMessage, ServerResponse } from 'http';
import { defineHook } from '@shuvi/hook';
import webpack, { MultiCompiler } from 'webpack';
import { SyncHook } from 'tapable';
import WebpackChain from 'webpack-chain';
import { IApiConfig, IUserRouteConfig, IShuviMode } from '../api/types';
import { IDocumentProps } from './runtime';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';

type ExtractSyncHookGeneric<Type> = Type extends SyncHook<infer X> ? X : never;
export type MultiStats = ExtractSyncHookGeneric<
  MultiCompiler['hooks']['done']
>[0];

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
export type IHookBeforeProjectBuild = defineHook<'projectBuilder:beforeBuild'>;

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
        stats: any;
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

export type IHookDestroy = defineHook<'destroy'>;

export type IEventAfterBuild = defineHook<'afterBuild'>;

export type IHookRenderToHTML = defineHook<
  'renderToHTML',
  {
    initialValue: (
      req: IncomingMessage,
      res: ServerResponse
    ) => Promise<string | null>;
  }
>;

export type IServerMiddleware = defineHook<
  'serverMiddleware',
  {
    initialValue: any;
  }
>;
