import WebpackChain from 'webpack-chain';
import { IWebpackConfigOptions } from '../bundler/config';
import webpack, { Configuration } from 'webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import { IShuviMode } from './types';

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

export type AppExport = {
  source: string;
  exported: string;
};

export type AppService = {
  source: string;
  exported: string;
  filepath: string;
};

export type BundleResource = {
  identifier: string;
  loader: () => any;
};
