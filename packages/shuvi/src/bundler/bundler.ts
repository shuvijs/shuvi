import { IHookBundlerConfig } from '@shuvi/types';
import Logger from '@shuvi/utils/lib/logger';
import { inspect } from 'util';
import webpack, {
  MultiCompiler as WebapckMultiCompiler,
  Compiler as WebapckCompiler,
  Configuration,
} from 'webpack';
import { Api } from '../api';
import { WEBPACK_CONFIG_CLIENT, WEBPACK_CONFIG_SERVER } from '../constants';
import { createWepbackConfig, getClientEntry, getServerEntry } from './config';
import { runCompiler, BundlerResult } from './runCompiler';

const logger = Logger('shuvi:bundler');

class BundlerImpl {
  private _api: Api;
  private _compiler: WebapckMultiCompiler | null = null;
  private _configs: Configuration[] = [];

  constructor(api: Api) {
    this._api = api;
  }

  addTarget(name: string, config: Configuration): this {
    if (this._compiler) {
      // TODO: warn can't add target after compiler init
      return this;
    }

    this._configs.push({ ...config, name });
    return this;
  }

  async getWebpackCompiler(): Promise<WebapckMultiCompiler> {
    if (!this._compiler) {
      const internalTargets = await this._getInternalTargets();
      this._compiler = webpack([...internalTargets, ...this._configs]);
    }

    return this._compiler!;
  }

  getSubCompiler(name: string): WebapckCompiler | undefined {
    if (!this._compiler) {
      return;
    }

    return this._compiler.compilers.find((compiler) => compiler.name === name);
  }

  async build(): Promise<BundlerResult> {
    const compiler = await this.getWebpackCompiler();
    return runCompiler(compiler);
  }

  private async _getInternalTargets(): Promise<Configuration[]> {
    let clientChain = createWepbackConfig(this._api, {
      name: WEBPACK_CONFIG_CLIENT,
      node: false,
      entry: getClientEntry(this._api),
    });
    clientChain = await this._api.callHook<IHookBundlerConfig>(
      {
        name: 'bundler:config',
        initialValue: clientChain,
      },
      {
        name: WEBPACK_CONFIG_CLIENT,
        mode: this._api.mode,
        webpack: webpack,
      }
    );

    let serverChain = createWepbackConfig(this._api, {
      name: WEBPACK_CONFIG_SERVER,
      node: true,
      entry: getServerEntry(this._api),
    });
    serverChain = await this._api.callHook<IHookBundlerConfig>(
      {
        name: 'bundler:config',
        initialValue: serverChain,
      },
      {
        name: WEBPACK_CONFIG_SERVER,
        mode: this._api.mode,
        webpack: webpack,
      }
    );

    const clientConfig = clientChain.toConfig();
    const serverConfig = serverChain.toConfig();

    logger.debug('Client Config');
    logger.debug(inspect(clientConfig.resolve?.plugins, { depth: 10 }));
    logger.debug('Server Config');
    logger.debug(inspect(serverConfig.resolve?.plugins, { depth: 10 }));

    return [clientConfig, serverConfig];
  }
}

export type Bundler = InstanceType<typeof BundlerImpl>;

export function getBundler(_api: Api): Bundler {
  return new BundlerImpl(_api);
}
