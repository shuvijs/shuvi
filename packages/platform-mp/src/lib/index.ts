// import React from 'react';
import { IApi, Runtime } from '@shuvi/types';
import { installPlatform } from './bundler/config';

class PlatformTaro implements Runtime.IRuntime<any> {
  _api!: IApi;

  async install(api: IApi): Promise<void> {
    installPlatform(api);
  }
}

export default new PlatformTaro();
