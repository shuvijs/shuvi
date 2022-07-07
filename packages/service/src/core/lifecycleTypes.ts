import { RequestListener } from 'http';
import { WebpackChain } from '@shuvi/toolpack/lib/webpack';
import webpack, { Configuration } from '@shuvi/toolpack/lib/webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import { defineFile, FileOptions } from '../project';
import { IWebpackConfigOptions } from '../bundler/config';
import { IShuviMode } from './apiTypes';

export type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChain;
  mode: IShuviMode;
  webpack: typeof webpack;
};

export type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviMode;
  webpack: typeof webpack;
  /**
   * require webpack interal module
   * eg. resolveWebpackModule('webpack/lib/dependencies/ConstDependency')
   */
  resolveWebpackModule: <Path extends string>(
    path: Path
  ) => Path extends `webpack/${infer _other}` ? any : never;
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
  defineFile: typeof defineFile;
  getContent: (file: FileOptions) => string;
};

export interface WebpackChainType extends WebpackChain {}

export type AfterBuildOptions = {
  requestHandler: RequestListener;
};
