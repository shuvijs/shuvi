// import React from 'react';
import { IApi, Runtime } from '@shuvi/types';

const platform: Runtime.IRuntime<any> = {
  async install(api: IApi): Promise<void> {
    const { target = 'binance' } = api.config.platform || {};
    const PlatformConstructor: Runtime.IRuntime = require(`./targets/${target}`)
      .default;
    //@ts-ignore
    const runtime = new PlatformConstructor(api);
    runtime.install();
  }
};

export default platform;
