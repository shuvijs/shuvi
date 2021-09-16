// import React from 'react';
import { IApi, Runtime } from '@shuvi/service';

const platform: Runtime.IRuntime<any> = {
  async install(api: IApi): Promise<void> {
    const { target = 'bmp' } = api.config.platform || {};
    const PlatformConstructor: Runtime.IRuntime = require(`./targets/${target}`)
      .default;
    //@ts-ignore
    const runtime = new PlatformConstructor(api);
    runtime.install();
  }
};

export default platform;
