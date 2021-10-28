// import React from 'react';
import { IApi } from '@shuvi/service';
import { IRuntime } from '@shuvi/platform-core';

const platform: IRuntime = {
  async install(api: IApi): Promise<void> {
    const { target = 'bmp' } = api.config.platform || {};
    const PlatformConstructor: IRuntime =
      require(`./targets/${target}`).default;
    //@ts-ignore
    const runtime = new PlatformConstructor(api);
    runtime.install();
  }
};

export default platform;
