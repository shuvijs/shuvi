import { Runtime } from '../types';

export default function (platform: string | undefined): Runtime.IRuntime {
  const platformName = `@shuvi/platform-${platform}`;
  const platformInstance: Runtime.IRuntime = require(platformName).default;
  return platformInstance;
}
