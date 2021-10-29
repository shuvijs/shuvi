// import React from 'react';
import { IRuntime } from '@shuvi/platform-core';

const platformMp: IRuntime = {
  async install(api): Promise<void> {
    const { target = 'bmp' } = api.config.platform || {};
    const PlatformConstructor: IRuntime =
      require(`./targets/${target}`).default;
    //@ts-ignore
    const runtime = new PlatformConstructor(api);
    runtime.install();
  }
};

export default platformMp;
