import { RequestListener } from 'http';
import WebpackChain from 'webpack-chain';
import webpack, { Configuration } from '@shuvi/toolpack/lib/webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import { createFile } from '../project';
import { IWebpackConfigOptions } from '../bundler/config';
import { IShuviMode } from './apiTypes';

export interface WebpackChainType extends WebpackChain {}

export type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChainType;
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
  chain: WebpackChainType;
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
};

export type AfterBuildOptions = {
  requestHandler: RequestListener;
};
