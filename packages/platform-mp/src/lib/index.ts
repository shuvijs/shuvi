// import React from 'react';
import { IApi, Runtime } from '@shuvi/types';

const platform: Runtime.IRuntime<any> = {
  async install(api: IApi): Promise<void> {
    const { target = 'binance' } = api.config.buildOptions || {};
    const packageName = `@shuvi/platform-mp-type-${target}`;
    const PlatformConstructor: Runtime.IRuntime = require(packageName).default;
    //@ts-ignore
    const runtime = new PlatformConstructor(api);
    runtime.install();
  }
};

export default platform;
