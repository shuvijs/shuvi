// import React from 'react';
import { IPlatform } from '@shuvi/service';

const platform: IPlatform = context => {
  const { target = 'bmp' } = context.config.platform || {};
  const PlatformConstructor = require(`./targets/${target}`).default;
  //@ts-ignore
  const runtime = new PlatformConstructor();
  return runtime.getPlugins();
};

export default platform;
