import { RequestListener } from 'http';
import WebpackChain from 'webpack-chain';
import webpack, { Configuration } from 'webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import { HookMap } from '@shuvi/hook';
import { createFile, fileUtils } from '../project';
import { IWebpackConfigOptions } from '../bundler/config';
import { IShuviMode } from './apiTypes';
import type { PluginManager } from './lifecycle';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export interface PluginHooks extends HookMap {}

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type ICliPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type ICliPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;

export type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChain;
  mode: IShuviMode;
  webpack: typeof webpack;
};

export type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviMode;
  webpack: typeof webpack;
  helpers: IWebpackHelpers;
};

export interface TargetChain {
  name: string;
  chain: WebpackChain;
}

export interface Target {
  name: string;
  config: Configuration;
}

export type BundlerDoneExtra = {
  first: boolean;
  stats: webpack.MultiStats;
};

export type BundlerTargetDoneExtra = {
  first: boolean;
  name: string;
  stats: webpack.Stats;
};

export type RuntimeService = {
  source: string;
  exported: string;
  filepath?: string;
};

export type Resources = [string, string | undefined];

export type AddRuntimeFileUtils = {
  createFile: typeof createFile;
  getAllFiles: typeof fileUtils.getAllFiles;
};

export interface WebpackChainType extends WebpackChain {}

export type AfterBuildOptions = {
  requestHandler: RequestListener;
};
