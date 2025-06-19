import { RequestListener } from 'http';
import { RspackChain } from '@shuvi/toolpack/lib/webpack';
import * as Rspack from '@shuvi/toolpack/lib/webpack';
import { rspack, Configuration } from '@shuvi/toolpack/lib/webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types.rspack';
import { defineFile, FileBuilder } from '../project/index';
import { IWebpackConfigOptions } from '../bundler/config';
import { IServiceMode } from './apiTypes';

export type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): RspackChain;
  mode: IServiceMode;
  webpack: typeof rspack;
};

export type ConfigWebpackAssistant = {
  name: string;
  mode: IServiceMode;
  webpack: typeof rspack;
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
  chain: RspackChain;
}

export interface Target {
  name: string;
  config: Configuration;
}

export type BundlerDoneExtra = {
  first: boolean;
  stats: Rspack.MultiStats;
};

export type BundlerTargetDoneExtra = {
  first: boolean;
  name: string;
  stats: Rspack.Stats;
};

export type RuntimeService = {
  source: string;
  exported: string;
  filepath?: string;
};

export type Resources = [string, string | undefined];

export type AddRuntimeFileUtils = {
  defineFile: typeof defineFile;
  getContent: FileBuilder<any>['getContent'];
};

export interface RspackChainType extends RspackChain {}

export type AfterBuildOptions = {
  requestHandler: RequestListener;
};
